package com.nikhil.integration_service.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nikhil.integration_service.configuration.ApyHubProperties;
import com.nikhil.integration_service.exception.ThirdPartyIntegrationException;
import lombok.AllArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.stereotype.Component;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
@AllArgsConstructor
public class ApyHubHtmlToPdfClient implements HtmlToPdfClient {
    private static final String PROVIDER = "apyhub";
    private static final ObjectMapper JSON = new ObjectMapper();

    private final RestClient restClient;
    private final ApyHubProperties props;
    private final ApyHubCredentials credentials;

    @Override
    public byte[] convertHtmlToPdf(
            byte[] htmlBytes,
            String originalFilename,
            String contentType,
            String outputFilename,
            boolean landscape
    ) {
        String token = credentials.tokenOrEmpty();
        if (token.isEmpty()) {
            throw new ThirdPartyIntegrationException(PROVIDER, "missing_token",
                    "ApyHub token is not set. Copy application-local.properties.example to "
                            + "application-local.properties in this service folder and set apyhub.token=... "
                            + "(run the app from that folder), or export APYHUB_TOKEN. No quotes in .properties files.");
        }

        String out = (outputFilename == null || outputFilename.isBlank()) ? "output.pdf" : outputFilename.trim();
        String url = props.baseUrl()
                + "/convert/html-file/pdf-file"
                + "?output=" + URLEncoder.encode(out, StandardCharsets.UTF_8)
                + "&landscape=" + landscape;

        MultipartBodyBuilder builder = new MultipartBodyBuilder();
        builder.part("file", new NamedByteArrayResource(htmlBytes, originalFilename))
                .contentType(resolveHtmlPartType(originalFilename, contentType));
        MultiValueMap<String, HttpEntity<?>> body = builder.build();

        try {
            return restClient.post()
                    .uri(url)
                    .header("apy-token", token)
                    .accept(MediaType.APPLICATION_PDF, MediaType.APPLICATION_OCTET_STREAM)
                    .body(body)
                    .retrieve()
                    .body(byte[].class);
        } catch (RestClientResponseException e) {
            int status = e.getStatusCode().value();
            if (status == 401) {
                throw new ThirdPartyIntegrationException(PROVIDER, "unauthorized",
                        "ApyHub rejected the API token (401). Set a valid token: export APYHUB_TOKEN=... "
                                + "Ensure application.properties has no quotes around the token value.", e);
            }
            String detail = parseApyHubErrorBody(e.getResponseBodyAsString(StandardCharsets.UTF_8));
            String msg = detail != null
                    ? detail
                    : ("ApyHub request failed with HTTP " + status + " (see ApyHub docs for 400/401/500).");
            throw new ThirdPartyIntegrationException(PROVIDER, "upstream_error", msg, e);
        } catch (Exception e) {
            throw new ThirdPartyIntegrationException(PROVIDER, "request_failed", "ApyHub request failed.", e);
        }
    }

    private static MediaType resolveHtmlPartType(String filename, String contentType) {
        if (contentType != null && contentType.toLowerCase().startsWith("text/html")) {
            return MediaType.TEXT_HTML;
        }
        if (filename != null) {
            String lower = filename.toLowerCase();
            if (lower.endsWith(".html") || lower.endsWith(".htm")) {
                return MediaType.TEXT_HTML;
            }
        }
        return MediaType.APPLICATION_OCTET_STREAM;
    }

    /**
     * ApyHub error JSON: {@code { "error": { "code": 104, "message": "..." } }}
     */
    private static String parseApyHubErrorBody(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        try {
            JsonNode root = JSON.readTree(raw);
            JsonNode err = root.path("error");
            if (err.isObject()) {
                int code = err.path("code").asInt(0);
                String message = err.path("message").asText("");
                if (!message.isEmpty()) {
                    return "ApyHub error " + code + ": " + message;
                }
            }
        } catch (Exception ignored) {
        }
        return null;
    }

    private static final class NamedByteArrayResource extends ByteArrayResource {
        private final String filename;

        private NamedByteArrayResource(byte[] byteArray, String filename) {
            super(byteArray);
            this.filename = (filename == null || filename.isBlank()) ? "file.html" : filename;
        }

        @Override
        public String getFilename() {
            return filename;
        }
    }
}

