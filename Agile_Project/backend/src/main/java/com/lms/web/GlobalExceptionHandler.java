package com.lms.web;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<Map<String, Object>> handleApiException(ApiException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("error", ex.getMessage());
        body.put("status", ex.getStatus().value());
        body.put("timestamp", LocalDateTime.now());
        return ResponseEntity.status(ex.getStatus()).body(body);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, Object> body = new HashMap<>();
        StringBuilder sb = new StringBuilder();
        for (FieldError fe : ex.getBindingResult().getFieldErrors()) {
            if (sb.length() > 0) sb.append(", ");
            sb.append(fe.getField()).append(": ").append(fe.getDefaultMessage());
        }
        body.put("error", sb.toString());
        body.put("status", HttpStatus.BAD_REQUEST.value());
        body.put("timestamp", LocalDateTime.now());
        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("error", ex.getMessage() != null ? ex.getMessage() : "An unexpected server error occurred");
        body.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
        body.put("timestamp", LocalDateTime.now());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }
}
