package com.nikhil.integration_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record BarcodeRequestDto(
        @NotBlank(message = "content is required")
        @Size(max = 80, message = "content must be 80 characters or less (ApyHub barcode API)")
        String content
) {
}
