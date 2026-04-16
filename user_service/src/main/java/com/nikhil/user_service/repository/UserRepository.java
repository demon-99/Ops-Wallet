package com.nikhil.user_service.repository;

import com.nikhil.user_service.dto.UserProfileResponseDto;
import com.nikhil.user_service.entity.User;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface UserRepository extends MongoRepository<User,String> {
    boolean existsByEmail(String email);
    User findByEmail(String email);
}
