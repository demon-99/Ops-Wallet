package com.nikhil.integration_service.client;

public interface DocumentConversionClient {
    byte[] convertImageToPdf(
            byte[] imageBytes,
            String originalFilename,
            String contentType,
            String outputFilename,
            boolean landscape
    );
}

