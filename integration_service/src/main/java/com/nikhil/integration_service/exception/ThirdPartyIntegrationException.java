package com.nikhil.integration_service.exception;

public class ThirdPartyIntegrationException extends RuntimeException {
    private final String provider;
    private final String code;

    public ThirdPartyIntegrationException(String provider, String code, String message) {
        super(message);
        this.provider = provider;
        this.code = code;
    }

    public ThirdPartyIntegrationException(String provider, String code, String message, Throwable cause) {
        super(message, cause);
        this.provider = provider;
        this.code = code;
    }

    public String getProvider() {
        return provider;
    }

    public String getCode() {
        return code;
    }
}

