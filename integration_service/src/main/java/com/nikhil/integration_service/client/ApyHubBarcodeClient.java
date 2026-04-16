package com.nikhil.integration_service.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nikhil.integration_service.configuration.ApyHubProperties;
import com.nikhil.integration_service.exception.ThirdPartyIntegrationException;
import lombok.AllArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@Component
@AllArgsConstructor
public class ApyHubBarcodeClient {
    private static final String PROVIDER = "apyhub";
    private static final ObjectMapper JSON = new ObjectMapper();

    private final RestClient restClient;
    private final ApyHubProperties props;
    private final ApyHubCredentials credentials;

    /**
     * POST {@code /generate/barcode/file} with JSON body {@code { "content": "..." }}.
     */
    public byte[] generateBarcode(String content, String outputFilename) {
        String token = credentials.tokenOrEmpty();
        if (token.isEmpty()) {
            throw new ThirdPartyIntegrationException(PROVIDER, "missing_token",
                    "ApyHub token is not set. Use application-local.properties (apyhub.token) or APYHUB_TOKEN.");
        }

        String out = (outputFilename == null || outputFilename.isBlank()) ? "output.png" : outputFilename.trim();
        String url = props.baseUrl()
                + "/generate/barcode/file"
                + "?output=" + URLEncoder.encode(out, StandardCharsets.UTF_8);

        Map<String, String> body = Map.of("content", content);

        try {
            return restClient.post()
                    .uri(url)
                    .header("apy-token", token)
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.IMAGE_PNG, MediaType.APPLICATION_OCTET_STREAM)
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
}
