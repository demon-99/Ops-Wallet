package com.nikhil.user_service.dto;

import lombok.Data;
@Data
public class UserProfileResponseDto {
    private String userId;  // MongoDB generates ObjectId automatically

    private String firstName;

    private String lastName;

    private String email;
}
