package com.skillbridge.controller;

import com.skillbridge.entity.Notification;
import com.skillbridge.security.AccessGuard;
import com.skillbridge.service.NotificationService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "In-app notifications for the signed-in user")
public class NotificationController {

    private final NotificationService notificationService;
    private final AccessGuard access;

    @GetMapping
    public List<Notification> list() {
        return notificationService.recent(access.currentEmployeeId());
    }

    @GetMapping("/unread-count")
    public Map<String, Long> unreadCount() {
        return Map.of("count", notificationService.unreadCount(access.currentEmployeeId()));
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<Void> markRead(@PathVariable Long id) {
        notificationService.markRead(access.currentEmployeeId(), id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/read-all")
    public ResponseEntity<Void> markAllRead() {
        notificationService.markAllRead(access.currentEmployeeId());
        return ResponseEntity.noContent().build();
    }
}
