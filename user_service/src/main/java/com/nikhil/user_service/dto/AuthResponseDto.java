package com.nikhil.user_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponseDto {
    private UserProfileResponseDto user;
    private String accessToken; // intentionally optional/placeholder
}

