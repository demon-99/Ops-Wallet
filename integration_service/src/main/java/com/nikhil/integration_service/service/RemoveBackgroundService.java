package com.nikhil.integration_service.service;

import com.nikhil.integration_service.client.ApyHubRemoveBackgroundClient;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class RemoveBackgroundService {
    private final ApyHubRemoveBackgroundClient client;

    public byte[] removeBackground(byte[] bytes, String originalFilename, String contentType, String outputFilename) {
        return client.removeBackground(bytes, originalFilename, contentType, outputFilename);
    }
}
