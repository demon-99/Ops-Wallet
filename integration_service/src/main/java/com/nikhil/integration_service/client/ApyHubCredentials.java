package com.nikhil.integration_service.client;

import com.nikhil.integration_service.configuration.ApyHubProperties;
import lombok.AllArgsConstructor;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

/**
 * Resolves the ApyHub API token from Spring config, env, or OS environment.
 */
@Component
@AllArgsConstructor
public class ApyHubCredentials {

    private final ApyHubProperties props;
    private final Environment environment;

    public String tokenOrEmpty() {
        String t = normalize(props.token());
        if (!t.isEmpty()) {
            return t;
        }
        t = normalize(environment.getProperty("apyhub.token"));
        if (!t.isEmpty()) {
            return t;
        }
        t = normalize(environment.getProperty("APYHUB_TOKEN"));
        if (!t.isEmpty()) {
            return t;
        }
        return normalize(System.getenv("APYHUB_TOKEN"));
    }

    private static String normalize(String raw) {
        if (raw == null) {
            return "";
        }
        String t = raw.trim();
        if (t.length() >= 2 && t.charAt(0) == '"' && t.charAt(t.length() - 1) == '"') {
            t = t.substring(1, t.length() - 1).trim();
        }
        return t;
    }
}
