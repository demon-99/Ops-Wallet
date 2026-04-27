package com.nikhil.activity_service.service;

import com.nikhil.activity_service.dto.ActivityRequestDto;
import com.nikhil.activity_service.entity.UserActivity;
import com.nikhil.activity_service.repository.UserActivityRepository;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
@AllArgsConstructor
public class UserActivityService {

    private final UserActivityRepository repository;
    private static final Logger logger = LoggerFactory.getLogger(UserActivityService.class);

    public UserActivity recordActivity(ActivityRequestDto dto) {
        UserActivity activity = new UserActivity();
        activity.setUserId(dto.getUserId().trim());
        activity.setActivityType(dto.getActivityType().trim());
        activity.setDescription(dto.getDescription());
        activity.setMetadata(dto.getMetadata());
        activity.setIpAddress(dto.getIpAddress());
        activity.setUserAgent(dto.getUserAgent());
        activity.setSessionId(dto.getSessionId());
        activity.setCreatedAt(new Date());

        UserActivity saved = repository.save(activity);
        logger.info("Recorded activity {}", saved);
        return saved;
    }

    public Page<UserActivity> getActivitiesForUser(String userId, int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100));
        return repository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
    }

    public Page<UserActivity> getActivitiesForUserByType(String userId, String activityType, int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100));
        return repository.findByUserIdAndActivityTypeOrderByCreatedAtDesc(userId, activityType, pageable);
    }

    public List<UserActivity> getRecentForUser(String userId) {
        return repository.findTop20ByUserIdOrderByCreatedAtDesc(userId);
    }

    public long countSince(String userId, Date since) {
        return repository.countByUserIdAndCreatedAtAfter(userId, since);
    }
}
