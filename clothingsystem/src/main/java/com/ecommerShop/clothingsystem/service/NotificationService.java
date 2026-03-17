package com.ecommerShop.clothingsystem.service;

import com.ecommerShop.clothingsystem.dto.NotificationResponse;
import com.ecommerShop.clothingsystem.model.Notification;
import com.ecommerShop.clothingsystem.model.User;
import java.util.List;

public interface NotificationService {
    void createNotification(User user, String title, String content, Notification.NotificationType type,
            boolean sendEmail);

    List<NotificationResponse> getNotifications(User user);

    long getUnreadCount(User user);

    void markAsRead(Long notificationId, User user);

    void markAllAsRead(User user);

    void deleteNotification(Long notificationId, User user);

    void deleteAllNotifications(User user);

    void broadcastGlobalNotification(String title, String content, Notification.NotificationType type);
}
