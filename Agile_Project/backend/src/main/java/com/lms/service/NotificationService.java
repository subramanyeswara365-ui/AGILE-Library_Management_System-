package com.lms.service;

import com.lms.entity.Notification;
import com.lms.entity.NotificationType;
import com.lms.entity.User;
import com.lms.repository.NotificationRepository;
import com.lms.repository.UserRepository;
import com.lms.web.ApiException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Transactional
    public Notification sendNotification(Long userId, String title, String message, NotificationType type) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return null;
        }

        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(type != null ? type : NotificationType.GENERAL)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();

        return notificationRepository.save(notification);
    }

    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public void markAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Notification not found"));

        if (!notification.getUser().getId().equals(userId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Unauthorized");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> list = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        for (Notification n : list) {
            if (!n.isRead()) {
                n.setRead(true);
                notificationRepository.save(n);
            }
        }
    }
}
