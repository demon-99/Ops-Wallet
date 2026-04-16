package com.nikhil.integration_service.controller;

import com.nikhil.integration_service.service.DocumentConversionService;
import com.nikhil.integration_service.util.ImageFormats;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.util.Locale;

@RestController
@RequestMapping("/api/convert")
@AllArgsConstructor
public class ConvertController {
    private final DocumentConversionService service;

    @PostMapping(value = "/image-to-pdf", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<byte[]> imageToPdf(
            @RequestParam("file") @NotNull MultipartFile file,
            @RequestParam(value = "output", required = false) String output,
            @RequestParam(value = "landscape", required = false, defaultValue = "false") boolean landscape
    ) throws Exception {
        if (ImageFormats.isEmptyOrCorrupt(file)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid input: file is empty or corrupt (ApyHub 400).");
        }
        if (!ImageFormats.isJpegJpgOrPng(file)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Provide the image in JPEG, JPG, or PNG format (ApyHub Image → PDF API)."
            );
        }
        byte[] pdf = service.imageToPdf(
                file.getBytes(),
                file.getOriginalFilename(),
                file.getContentType(),
                output,
                landscape
        );

        String filename = (output == null || output.isBlank()) ? "output.pdf" : output.trim();
        ContentDisposition disposition = ContentDisposition.attachment()
                .filename(filename, StandardCharsets.UTF_8)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @PostMapping(value = "/html-to-pdf", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<byte[]> htmlToPdf(
            @RequestParam("file") @NotNull MultipartFile file,
            @RequestParam(value = "output", required = false) String output,
            @RequestParam(value = "landscape", required = false, defaultValue = "false") boolean landscape
    ) throws Exception {
        if (ImageFormats.isEmptyOrCorrupt(file)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid input: file is empty or corrupt (ApyHub 400).");
        }
        if (!isHtml(file.getOriginalFilename(), file.getContentType())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Provide an HTML file (.html/.htm) (ApyHub HTML → PDF API)."
            );
        }

        byte[] pdf = service.htmlToPdf(
                file.getBytes(),
                file.getOriginalFilename(),
                file.getContentType(),
                output,
                landscape
        );

        String filename = (output == null || output.isBlank()) ? "output.pdf" : output.trim();
        ContentDisposition disposition = ContentDisposition.attachment()
                .filename(filename, StandardCharsets.UTF_8)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    private static boolean isHtml(String filename, String contentType) {
        if (contentType != null && contentType.toLowerCase(Locale.ROOT).startsWith("text/html")) {
            return true;
        }
        if (filename == null || filename.isBlank()) {
            return false;
        }
        String lower = filename.toLowerCase(Locale.ROOT);
        return lower.endsWith(".html") || lower.endsWith(".htm");
    }
}

