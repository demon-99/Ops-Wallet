package com.nikhil.user_service.controller;

import com.nikhil.user_service.dto.AuthResponseDto;
import com.nikhil.user_service.dto.LoginRequestDto;
import com.nikhil.user_service.dto.UserProfileResponseDto;
import com.nikhil.user_service.dto.UserRequestDto;
import com.nikhil.user_service.entity.User;
import com.nikhil.user_service.service.UserService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@AllArgsConstructor
@RestController
@RequestMapping("/api/auth")
public class UserController {
    private final UserService userService;

    private static UserProfileResponseDto toProfile(User u) {
        UserProfileResponseDto dto = new UserProfileResponseDto();
        dto.setUserId(u.getUserId());
        dto.setEmail(u.getEmail());
        dto.setFirstName(u.getFirstName());
        dto.setLastName(u.getLastName());
        return dto;
    }

    @PostMapping("/signup")
    public ResponseEntity<AuthResponseDto> signup(@Valid @RequestBody UserRequestDto userRequestDto) {
        User created = userService.createUser(userRequestDto);
        return new ResponseEntity<>(new AuthResponseDto(toProfile(created), null), HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequestDto loginRequestDto) {
        try {
            User loggedInUser = userService.loginUser(loginRequestDto);
            return new ResponseEntity<>(new AuthResponseDto(toProfile(loggedInUser), null), HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", e.getMessage() != null ? e.getMessage() : "Unauthorized"));
        }
    }
}
