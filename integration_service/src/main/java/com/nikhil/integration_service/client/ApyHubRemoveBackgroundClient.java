package com.nikhil.integration_service.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nikhil.integration_service.configuration.ApyHubProperties;
import com.nikhil.integration_service.exception.ThirdPartyIntegrationException;
import com.nikhil.integration_service.util.ImageFormats;
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
public class ApyHubRemoveBackgroundClient {
    private static final String PROVIDER = "apyhub";
    private static final ObjectMapper JSON = new ObjectMapper();

    private final RestClient restClient;
    private final ApyHubProperties props;
    private final ApyHubCredentials credentials;

    public byte[] removeBackground(byte[] imageBytes, String originalFilename, String contentType, String outputFilename) {
        String token = credentials.tokenOrEmpty();
        if (token.isEmpty()) {
            throw new ThirdPartyIntegrationException(PROVIDER, "missing_token",
                    "ApyHub token is not set. Use application-local.properties with apyhub.token=... or APYHUB_TOKEN.");
        }

        String out = (outputFilename == null || outputFilename.isBlank()) ? "no-background.png" : outputFilename.trim();
        String url = props.baseUrl()
                + "/processor/image/remove-background/file"
                + "?output=" + URLEncoder.encode(out, StandardCharsets.UTF_8);

        MediaType partType = ImageFormats.resolveRemoveBackgroundPartType(originalFilename, contentType);
        MultipartBodyBuilder builder = new MultipartBodyBuilder();
        builder.part("image", new NamedByteArrayResource(imageBytes, originalFilename))
                .contentType(partType);
        MultiValueMap<String, HttpEntity<?>> body = builder.build();

        try {
            return restClient.post()
                    .uri(url)
                    .header("apy-token", token)
                    .accept(MediaType.IMAGE_PNG, MediaType.IMAGE_JPEG, MediaType.APPLICATION_OCTET_STREAM)
                    .body(body)
                    .retrieve()
                    .body(byte[].class);
        } catch (RestClientResponseException e) {
            int status = e.getStatusCode().value();
            if (status == 401) {
                throw new ThirdPartyIntegrationException(PROVIDER, "unauthorized",
                        "ApyHub rejected the API token (401).", e);
            }
            String detail = parseApyHubErrorBody(e.getResponseBodyAsString(StandardCharsets.UTF_8));
            String msg = detail != null
                    ? detail
                    : ("ApyHub request failed with HTTP " + status + ".");
            throw new ThirdPartyIntegrationException(PROVIDER, "upstream_error", msg, e);
        } catch (Exception e) {
            throw new ThirdPartyIntegrationException(PROVIDER, "request_failed", "ApyHub request failed.", e);
        }
    }

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
            this.filename = (filename == null || filename.isBlank()) ? "image" : filename;
        }

        @Override
        public String getFilename() {
            return filename;
        }
    }
}
