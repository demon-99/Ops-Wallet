package com.nikhil.integration_service.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ThirdPartyIntegrationException.class)
    public ResponseEntity<ApiErrorResponse> handleIntegration(ThirdPartyIntegrationException e) {
        ApiErrorResponse body = new ApiErrorResponse(e.getMessage(), e.getProvider(), e.getCode());
        return new ResponseEntity<>(body, HttpStatus.BAD_GATEWAY);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidation(MethodArgumentNotValidException e) {
        String msg = e.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(err -> err.getDefaultMessage() != null ? err.getDefaultMessage() : "Invalid input")
                .orElse("Invalid input");
        ApiErrorResponse body = new ApiErrorResponse(msg, "validation", "invalid_input");
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }
}

