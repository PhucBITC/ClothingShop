package com.ecommerShop.clothingsystem.service.impl;

import com.ecommerShop.clothingsystem.dto.NotificationResponse;
import com.ecommerShop.clothingsystem.model.Notification;
import com.ecommerShop.clothingsystem.model.User;
import com.ecommerShop.clothingsystem.repository.NotificationRepository;
import com.ecommerShop.clothingsystem.repository.UserRepository;
import com.ecommerShop.clothingsystem.service.EmailService;
import com.ecommerShop.clothingsystem.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationServiceImpl implements NotificationService {
    private static final Logger logger = LoggerFactory.getLogger(NotificationServiceImpl.class);

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    @Override
    @Transactional
    public void createNotification(User user, String title, String content, Notification.NotificationType type,
            boolean sendEmail) {
        Notification notification = new Notification(user, title, content, type);
        notificationRepository.save(notification);

        if (sendEmail && user.getEmail() != null) {
            String htmlBody = "<h3>" + title + "</h3><p>" + content + "</p>";
            System.out.println("DEBUG: Triggering email send to: " + user.getEmail());
            // Catch email errors to prevent transaction rollback for the notification
            // itself
            try {
                emailService.sendHtmlMessage(user.getEmail(), "L&P Clothing: " + title, htmlBody);
            } catch (Exception e) {
                System.err.println("ERROR: Failed to send email to " + user.getEmail() + ": " + e.getMessage());
            }
        } else if (sendEmail) {
            System.err.println("WARNING: Cannot send email for user " + user.getId() + " because email is null.");
        }
    }

    @Override
    public List<NotificationResponse> getNotifications(User user) {
        logger.info("Fetching notifications for user ID: {} ({})", user.getId(), user.getEmail());
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        logger.info("Found {} notifications for user ID: {}", notifications.size(), user.getId());
        return notifications.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public long getUnreadCount(User user) {
        long count = notificationRepository.countByUserIdAndIsReadFalse(user.getId());
        logger.info("Unread count for user ID {}: {}", user.getId(), count);
        return count;
    }

    @Override
    @Transactional
    public void markAsRead(Long notificationId, User user) {
        System.out.println("DEBUG: markAsRead called for ID: " + notificationId + " and User: " + user.getEmail());
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        System.out.println("DEBUG: Notification found. Owner ID: " + notification.getUser().getId()
                + ", Current User ID: " + user.getId());

        if (notification.getUser().getId().longValue() == user.getId().longValue()) {
            notification.setRead(true);
            notificationRepository.save(notification);
            System.out.println("DEBUG: Notification " + notificationId + " marked as read and saved.");
        } else {
            System.err.println("DEBUG: User ID mismatch! Unauthorized attempt to mark notification as read.");
        }
    }

    @Override
    @Transactional
    public void markAllAsRead(User user) {
        List<Notification> unread = notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .filter(n -> !n.isRead())
                .collect(Collectors.toList());

        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    @Override
    @Transactional
    public void deleteNotification(Long notificationId, User user) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (notification.getUser().getId().equals(user.getId())) {
            notificationRepository.delete(notification);
        }
    }

    @Override
    @Transactional
    public void deleteAllNotifications(User user) {
        List<Notification> all = notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        notificationRepository.deleteAll(all);
    }

    @Override
    @Transactional
    public void broadcastGlobalNotification(String title, String content, Notification.NotificationType type) {
        logger.info("Starting broadcast for title: '{}'", title);
        
        List<User> allUsers = userRepository.findAll();
        logger.info("Found {} total users in database", allUsers.size());
        
        int successCount = 0;
        for (User u : allUsers) {
            try {
                // Ensure the user object is not null and has an ID
                if (u == null || u.getId() == null) {
                    logger.warn("Skipping a null user or user with null ID");
                    continue;
                }
                
                Notification notification = new Notification(u, title, content, type);
                notificationRepository.save(notification);
                successCount++;
                logger.info("Successfully created notification for user ID: {} ({})", u.getId(), u.getEmail());
            } catch (Exception e) {
                logger.error("Failed to create notification for user ID: {}", u != null ? u.getId() : "unknown", e);
            }
        }
        
        // Force flush to ensure records are written to DB before transaction commits
        notificationRepository.flush();
        logger.info("Broadcast complete. Successfully notified {}/{} users and flushed to database", successCount, allUsers.size());
    }

    private NotificationResponse mapToResponse(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getTitle(),
                notification.getContent(),
                notification.getType().name(),
                notification.isRead(),
                notification.getCreatedAt());
    }
}
