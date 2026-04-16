package com.nikhil.integration_service.util;

import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;

import java.util.Locale;

/** ApyHub Image → PDF accepts JPEG, JPG, and PNG only. */
public final class ImageFormats {

    private ImageFormats() {
    }

    public static boolean isEmptyOrCorrupt(MultipartFile file) {
        return file == null || file.isEmpty();
    }

    /**
     * Allowed if Content-Type is image/jpeg or image/png, or filename ends with .jpg / .jpeg / .png.
     */
    public static boolean isJpegJpgOrPng(MultipartFile file) {
        if (file == null) {
            return false;
        }
        String ct = file.getContentType();
        if (ct != null) {
            if ("image/jpeg".equalsIgnoreCase(ct) || "image/png".equalsIgnoreCase(ct)) {
                return true;
            }
        }
        return filenameIsJpegJpgOrPng(file.getOriginalFilename());
    }

    public static boolean filenameIsJpegJpgOrPng(String filename) {
        if (filename == null || filename.isBlank()) {
            return false;
        }
        String lower = filename.toLowerCase(Locale.ROOT);
        return lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".png");
    }

    /**
     * Content-Type for the multipart {@code file} part when forwarding to ApyHub.
     */
    /** True if MIME is image/jpeg or image/png, or filename ends with .jpg / .jpeg / .png. */
    public static boolean isAllowedForApyHub(String filename, String contentType) {
        if (contentType != null) {
            if ("image/jpeg".equalsIgnoreCase(contentType) || "image/png".equalsIgnoreCase(contentType)) {
                return true;
            }
        }
        return filenameIsJpegJpgOrPng(filename);
    }

    /**
     * Multipart {@code file} part Content-Type for ApyHub (prefers filename extension, then MIME).
     */
    public static MediaType resolvePartMediaType(String filename, String contentType) {
        if (filename != null && !filename.isBlank()) {
            String lower = filename.toLowerCase(Locale.ROOT);
            if (lower.endsWith(".png")) {
                return MediaType.IMAGE_PNG;
            }
            if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) {
                return MediaType.IMAGE_JPEG;
            }
        }
        if (contentType != null) {
            if ("image/png".equalsIgnoreCase(contentType)) {
                return MediaType.IMAGE_PNG;
            }
            if ("image/jpeg".equalsIgnoreCase(contentType)) {
                return MediaType.IMAGE_JPEG;
            }
        }
        return MediaType.IMAGE_JPEG;
    }

    /** ApyHub remove-background: WebP, JPG, JPEG, PNG, BMP, GIF, TIFF (docs). */
    public static boolean isRemoveBackgroundAllowed(MultipartFile file) {
        if (file == null) {
            return false;
        }
        String ct = file.getContentType();
        if (ct != null && isRemoveBackgroundMime(ct)) {
            return true;
        }
        return filenameIsRemoveBackground(file.getOriginalFilename());
    }

    public static boolean filenameIsRemoveBackground(String filename) {
        if (filename == null || filename.isBlank()) {
            return false;
        }
        String lower = filename.toLowerCase(Locale.ROOT);
        return lower.endsWith(".webp")
                || lower.endsWith(".jpg")
                || lower.endsWith(".jpeg")
                || lower.endsWith(".png")
                || lower.endsWith(".bmp")
                || lower.endsWith(".gif")
                || lower.endsWith(".tif")
                || lower.endsWith(".tiff");
    }

    private static boolean isRemoveBackgroundMime(String contentType) {
        if (contentType == null) {
            return false;
        }
        String c = contentType.toLowerCase(Locale.ROOT);
        return c.startsWith("image/webp")
                || c.startsWith("image/jpeg")
                || c.startsWith("image/png")
                || c.startsWith("image/bmp")
                || c.startsWith("image/gif")
                || c.startsWith("image/tiff");
    }

    /**
     * Multipart {@code image} part Content-Type for ApyHub remove-background.
     */
    public static MediaType resolveRemoveBackgroundPartType(String filename, String contentType) {
        if (filename != null && !filename.isBlank()) {
            String lower = filename.toLowerCase(Locale.ROOT);
            if (lower.endsWith(".png")) {
                return MediaType.IMAGE_PNG;
            }
            if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) {
                return MediaType.IMAGE_JPEG;
            }
            if (lower.endsWith(".gif")) {
                return MediaType.IMAGE_GIF;
            }
            if (lower.endsWith(".webp")) {
                return MediaType.parseMediaType("image/webp");
            }
            if (lower.endsWith(".bmp")) {
                return MediaType.parseMediaType("image/bmp");
            }
            if (lower.endsWith(".tif") || lower.endsWith(".tiff")) {
                return MediaType.parseMediaType("image/tiff");
            }
        }
        if (contentType != null && !contentType.isBlank()) {
            try {
                return MediaType.parseMediaType(contentType);
            } catch (Exception ignored) {
            }
        }
        return MediaType.APPLICATION_OCTET_STREAM;
    }
}
