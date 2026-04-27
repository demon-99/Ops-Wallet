package com.nikhil.activity_service.repository;

import com.nikhil.activity_service.entity.UserActivity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Date;
import java.util.List;

public interface UserActivityRepository extends MongoRepository<UserActivity, String> {
    Page<UserActivity> findByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);
    List<UserActivity> findTop20ByUserIdOrderByCreatedAtDesc(String userId);
    Page<UserActivity> findByUserIdAndActivityTypeOrderByCreatedAtDesc(String userId, String activityType, Pageable pageable);
    long countByUserIdAndCreatedAtAfter(String userId, Date after);
}
