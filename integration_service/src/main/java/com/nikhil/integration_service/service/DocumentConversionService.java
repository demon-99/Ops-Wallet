package com.nikhil.integration_service.service;

import com.nikhil.integration_service.client.DocumentConversionClient;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class DocumentConversionService {
    private final DocumentConversionClient client;

    public byte[] imageToPdf(
            byte[] imageBytes,
            String originalFilename,
            String contentType,
            String outputFilename,
            boolean landscape
    ) {
        return client.convertImageToPdf(imageBytes, originalFilename, contentType, outputFilename, landscape);
    }
}

