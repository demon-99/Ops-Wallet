package com.nikhil.activity_service.controller;

import com.nikhil.activity_service.dto.ActivityRequestDto;
import com.nikhil.activity_service.dto.ActivityResponseDto;
import com.nikhil.activity_service.entity.UserActivity;
import com.nikhil.activity_service.service.UserActivityService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;
import java.util.Map;

@AllArgsConstructor
@RestController
@RequestMapping("/api/activity")
public class UserActivityController {

    private final UserActivityService activityService;

    private static ActivityResponseDto toDto(UserActivity a) {
        ActivityResponseDto dto = new ActivityResponseDto();
        dto.setActivityId(a.getActivityId());
        dto.setUserId(a.getUserId());
        dto.setActivityType(a.getActivityType());
        dto.setDescription(a.getDescription());
        dto.setMetadata(a.getMetadata());
        dto.setIpAddress(a.getIpAddress());
        dto.setUserAgent(a.getUserAgent());
        dto.setSessionId(a.getSessionId());
        dto.setCreatedAt(a.getCreatedAt());
        return dto;
    }

    @PostMapping("/log")
    public ResponseEntity<ActivityResponseDto> log(@Valid @RequestBody ActivityRequestDto dto,
                                                   HttpServletRequest request) {
        if (dto.getIpAddress() == null || dto.getIpAddress().isBlank()) {
            dto.setIpAddress(resolveIp(request));
        }
        if (dto.getUserAgent() == null || dto.getUserAgent().isBlank()) {
            dto.setUserAgent(request.getHeader("User-Agent"));
        }
        UserActivity saved = activityService.recordActivity(dto);
        return new ResponseEntity<>(toDto(saved), HttpStatus.CREATED);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<Map<String, Object>> listForUser(@PathVariable String userId,
                                                           @RequestParam(defaultValue = "0") int page,
                                                           @RequestParam(defaultValue = "20") int size,
                                                           @RequestParam(required = false) String activityType) {
        Page<UserActivity> result = (activityType == null || activityType.isBlank())
                ? activityService.getActivitiesForUser(userId, page, size)
                : activityService.getActivitiesForUserByType(userId, activityType, page, size);

        List<ActivityResponseDto> items = result.getContent().stream()
                .map(UserActivityController::toDto)
                .toList();

        return ResponseEntity.ok(Map.of(
                "items", items,
                "page", result.getNumber(),
                "size", result.getSize(),
                "totalElements", result.getTotalElements(),
                "totalPages", result.getTotalPages()
        ));
    }

    @GetMapping("/user/{userId}/recent")
    public ResponseEntity<List<ActivityResponseDto>> recentForUser(@PathVariable String userId) {
        List<ActivityResponseDto> items = activityService.getRecentForUser(userId).stream()
                .map(UserActivityController::toDto)
                .toList();
        return ResponseEntity.ok(items);
    }

    @GetMapping("/user/{userId}/count")
    public ResponseEntity<Map<String, Object>> countSince(@PathVariable String userId,
                                                          @RequestParam(defaultValue = "24") int hours) {
        long h = Math.max(hours, 1);
        Date since = new Date(System.currentTimeMillis() - h * 3600_000L);
        long count = activityService.countSince(userId, since);
        return ResponseEntity.ok(Map.of(
                "userId", userId,
                "since", since,
                "count", count
        ));
    }

    private static String resolveIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            int comma = forwarded.indexOf(',');
            return (comma > 0 ? forwarded.substring(0, comma) : forwarded).trim();
        }
        return request.getRemoteAddr();
    }
}
