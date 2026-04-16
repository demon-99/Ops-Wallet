package com.nikhil.integration_service.service;

import com.nikhil.integration_service.client.ApyHubBarcodeClient;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class BarcodeService {
    private final ApyHubBarcodeClient client;

    public byte[] generateBarcode(String content, String outputFilename) {
        return client.generateBarcode(content, outputFilename);
    }
}
