package com.nikhil.integration_service.service;

import com.nikhil.integration_service.client.ApyHubWebpageScreenshotClient;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class WebpageScreenshotService {
    private final ApyHubWebpageScreenshotClient client;

    public byte[] capture(String pageUrl, String outputFilename, Integer delaySeconds, Integer quality) {
        return client.captureWebpage(pageUrl, outputFilename, delaySeconds, quality);
    }
}
