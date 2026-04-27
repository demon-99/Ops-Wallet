package com.nikhil.activity_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
public class ActivityRequestDto {

    @NotBlank(message = "userId is required")
    private String userId;

    @NotBlank(message = "activityType is required")
    @Size(max = 64, message = "activityType must be at most 64 characters")
    private String activityType;

    @Size(max = 500, message = "description must be at most 500 characters")
    private String description;

    private Map<String, Object> metadata;

    private String ipAddress;

    private String userAgent;

    private String sessionId;

    @Override
    public String toString() {
        return "ActivityRequestDto{" +
                "userId='" + userId + '\'' +
                ", activityType='" + activityType + '\'' +
                ", sessionId='" + sessionId + '\'' +
                '}';
    }
}
