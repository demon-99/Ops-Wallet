package com.nikhil.integration_service.controller;

import com.nikhil.integration_service.dto.BarcodeRequestDto;
import com.nikhil.integration_service.service.BarcodeService;
import com.nikhil.integration_service.service.WebpageScreenshotService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/generate")
@AllArgsConstructor
public class GenerateController {
    private final BarcodeService barcodeService;
    private final WebpageScreenshotService webpageScreenshotService;

    /**
     * Proxies ApyHub: POST {@code /generate/barcode/file} with JSON {@code { "content": "..." }}.
     */
    @PostMapping(value = "/barcode", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<byte[]> barcode(
            @Valid @RequestBody BarcodeRequestDto request,
            @RequestParam(value = "output", required = false) String output
    ) {
        String trimmed = request.content().trim();
        byte[] image = barcodeService.generateBarcode(trimmed, output);

        String filename = (output == null || output.isBlank()) ? "output.png" : output.trim();
        ContentDisposition disposition = ContentDisposition.attachment()
                .filename(filename, StandardCharsets.UTF_8)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .contentType(MediaType.IMAGE_PNG)
                .body(image);
    }

    /**
     * Proxies ApyHub: {@code GET /generate/screenshot/webpage/image-file}.
     */
    @GetMapping("/screenshot/webpage")
    public ResponseEntity<byte[]> webpageScreenshot(
            @RequestParam("url") String url,
            @RequestParam(value = "output", required = false) String output,
            @RequestParam(value = "delay", required = false) Integer delay,
            @RequestParam(value = "quality", required = false) Integer quality
    ) {
        if (url == null || url.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "url is required.");
        }
        String pageUrl = url.trim();
        if (!pageUrl.startsWith("http://") && !pageUrl.startsWith("https://")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "url must start with http:// or https://");
        }
        if (quality != null && (quality < 1 || quality > 5)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "quality must be between 1 and 5 (ApyHub docs).");
        }
        if (delay != null && delay < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "delay must be zero or positive (seconds).");
        }

        byte[] image = webpageScreenshotService.capture(pageUrl, output, delay, quality);

        String filename = (output == null || output.isBlank()) ? "output.png" : output.trim();
        ContentDisposition disposition = ContentDisposition.attachment()
                .filename(filename, StandardCharsets.UTF_8)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .contentType(MediaType.IMAGE_PNG)
                .body(image);
    }
}
