package com.nikhil.user_service.service;

import com.nikhil.user_service.dto.LoginRequestDto;
import com.nikhil.user_service.dto.UserRequestDto;
import com.nikhil.user_service.entity.User;
import com.nikhil.user_service.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.Optional;

@Service
@AllArgsConstructor
public class UserService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    public User createUser(UserRequestDto userRequestDto){
        String email = userRequestDto.getEmail() == null ? "" : userRequestDto.getEmail().trim().toLowerCase();
        if(userRepository.existsByEmail(email)){
            logger.info("Email already in use.");
            throw new DuplicateKeyException("Email already in use.");
        }
        User user = new User();
        logger.info(userRequestDto.toString());

        user.setFirstName(userRequestDto.getFirstName());
        user.setLastName(userRequestDto.getLastName());
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(userRequestDto.getPassword()));
        logger.info(user.toString());
        return userRepository.save(user);
    }
    public User loginUser(LoginRequestDto loginRequestDto) throws Exception{
        String email = loginRequestDto.getEmail() == null ? "" : loginRequestDto.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmail(email);
        if(user==null){
            throw new Exception("User not found.");
        }
        if(!passwordEncoder.matches(loginRequestDto.getPassword(), user.getPasswordHash())){
            throw new Exception("Incorrect email or password.");
        }
        logger.info(user.toString());
        user.setLastLogin(new Date());
        logger.info(user.toString());
        userRepository.save(user);
        return user;
    }

    public User getUserProfile(String userId) throws Exception{
        Optional<User> userOptional = userRepository.findById(userId);

        // Use orElseThrow to throw an exception if user is not present
        return userOptional.orElseThrow(() -> new Exception("User not found."));
    }
}
