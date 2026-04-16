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
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.nio.charset.StandardCharsets;

/**
 * ApyHub: {@code GET /generate/screenshot/webpage/image-file} — full-page webpage screenshot.
 */
@Component
@AllArgsConstructor
public class ApyHubWebpageScreenshotClient {
    private static final String PROVIDER = "apyhub";
    private static final ObjectMapper JSON = new ObjectMapper();

    private final RestClient restClient;
    private final ApyHubProperties props;
    private final ApyHubCredentials credentials;

    public byte[] captureWebpage(String pageUrl, String outputFilename, Integer delaySeconds, Integer quality) {
        String token = credentials.tokenOrEmpty();
        if (token.isEmpty()) {
            throw new ThirdPartyIntegrationException(PROVIDER, "missing_token",
                    "ApyHub token is not set. Use application-local.properties (apyhub.token) or APYHUB_TOKEN.");
        }

        UriComponentsBuilder b = UriComponentsBuilder
                .fromUriString(props.baseUrl() + "/generate/screenshot/webpage/image-file")
                .queryParam("url", pageUrl);
        if (outputFilename != null && !outputFilename.isBlank()) {
            b.queryParam("output", outputFilename.trim());
        }
        if (delaySeconds != null) {
            b.queryParam("delay", delaySeconds);
        }
        if (quality != null) {
            b.queryParam("quality", quality);
        }
        URI uri = b.build().encode().toUri();

        try {
            return restClient.get()
                    .uri(uri)
                    .header("apy-token", token)
                    .accept(MediaType.IMAGE_PNG, MediaType.IMAGE_JPEG, MediaType.APPLICATION_OCTET_STREAM)
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
