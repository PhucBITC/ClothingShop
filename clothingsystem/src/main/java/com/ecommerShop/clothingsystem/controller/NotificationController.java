package com.ecommerShop.clothingsystem.controller;

import com.ecommerShop.clothingsystem.dto.NotificationResponse;
import com.ecommerShop.clothingsystem.model.User;
import com.ecommerShop.clothingsystem.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getNotifications(@AuthenticationPrincipal User user) {
        if (user == null) {
            System.err.println("CRITICAL DBG: User principal is NULL in getNotifications! Check AuthContext or JWT.");
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(notificationService.getNotifications(user));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount(@AuthenticationPrincipal User user) {
        if (user == null) {
            System.err.println("CRITICAL DBG: User principal is NULL in getUnreadCount!");
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(notificationService.getUnreadCount(user));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id, @AuthenticationPrincipal User user) {
        notificationService.markAsRead(id, user);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/mark-all-read")
    public ResponseEntity<?> markAllAsRead(@AuthenticationPrincipal User user) {
        notificationService.markAllAsRead(user);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNotification(@PathVariable Long id, @AuthenticationPrincipal User user) {
        notificationService.deleteNotification(id, user);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/all")
    public ResponseEntity<?> deleteAllNotifications(@AuthenticationPrincipal User user) {
        notificationService.deleteAllNotifications(user);
        return ResponseEntity.ok().build();
    }
}
