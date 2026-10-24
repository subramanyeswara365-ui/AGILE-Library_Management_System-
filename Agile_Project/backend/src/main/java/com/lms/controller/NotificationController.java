package com.lms.controller;

import com.lms.entity.Notification;
import com.lms.service.NotificationService;
import com.lms.web.CurrentUser;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<Notification>> getNotifications(HttpServletRequest request) {
        Long userId = CurrentUser.requireUserId(request);
        return ResponseEntity.ok(notificationService.getUserNotifications(userId));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Object>> getUnreadCount(HttpServletRequest request) {
        Long userId = CurrentUser.requireUserId(request);
        return ResponseEntity.ok(Map.of("unreadCount", notificationService.getUnreadCount(userId)));
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<Map<String, Object>> markAsRead(@PathVariable Long id, HttpServletRequest request) {
        Long userId = CurrentUser.requireUserId(request);
        notificationService.markAsRead(id, userId);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @PostMapping("/read-all")
    public ResponseEntity<Map<String, Object>> markAllAsRead(HttpServletRequest request) {
        Long userId = CurrentUser.requireUserId(request);
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(Map.of("success", true));
    }
}
