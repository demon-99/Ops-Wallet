package com.nikhil.integration_service.configuration;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "apyhub")
public record ApyHubProperties(
        String baseUrl,
        String token
) {
}

