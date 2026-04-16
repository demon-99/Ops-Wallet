package com.nikhil.integration_service.controller;

import com.nikhil.integration_service.service.RemoveBackgroundService;
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

@RestController
@RequestMapping("/api/processor")
@AllArgsConstructor
public class ProcessorController {
    private final RemoveBackgroundService removeBackgroundService;

    @PostMapping(value = "/remove-background", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<byte[]> removeBackground(
            @RequestParam("image") @NotNull MultipartFile image,
            @RequestParam(value = "output", required = false) String output
    ) throws Exception {
        if (ImageFormats.isEmptyOrCorrupt(image)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid input: image is empty or corrupt.");
        }
        if (!ImageFormats.isRemoveBackgroundAllowed(image)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Supported formats: WebP, JPG, JPEG, PNG, BMP, GIF, TIFF (ApyHub remove-background API)."
            );
        }

        byte[] outBytes = removeBackgroundService.removeBackground(
                image.getBytes(),
                image.getOriginalFilename(),
                image.getContentType(),
                output
        );

        String filename = (output == null || output.isBlank()) ? "no-background.png" : output.trim();
        ContentDisposition disposition = ContentDisposition.attachment()
                .filename(filename, StandardCharsets.UTF_8)
                .build();

        MediaType mediaType = MediaType.APPLICATION_OCTET_STREAM;
        String lower = filename.toLowerCase();
        if (lower.endsWith(".png")) {
            mediaType = MediaType.IMAGE_PNG;
        } else if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) {
            mediaType = MediaType.IMAGE_JPEG;
        } else if (lower.endsWith(".webp")) {
            mediaType = MediaType.parseMediaType("image/webp");
        } else if (lower.endsWith(".gif")) {
            mediaType = MediaType.IMAGE_GIF;
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .contentType(mediaType)
                .body(outBytes);
    }
}
