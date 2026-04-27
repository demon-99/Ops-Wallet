package com.nikhil.activity_service.dto;

import lombok.Data;

import java.util.Date;
import java.util.Map;

@Data
public class ActivityResponseDto {
    private String activityId;
    private String userId;
    private String activityType;
    private String description;
    private Map<String, Object> metadata;
    private String ipAddress;
    private String userAgent;
    private String sessionId;
    private Date createdAt;
}
