package com.nikhil.integration_service.client;

public interface HtmlToPdfClient {
    byte[] convertHtmlToPdf(
            byte[] htmlBytes,
            String originalFilename,
            String contentType,
            String outputFilename,
            boolean landscape
    );
}

