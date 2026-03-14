package com.ecommerShop.clothingsystem.controller;

import com.ecommerShop.clothingsystem.model.ContactMessage;
import com.ecommerShop.clothingsystem.repository.ContactMessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/contact")
public class ContactController {

    @Autowired
    private ContactMessageRepository contactMessageRepository;

    // Submit contact form (Public)
    @PostMapping
    public ResponseEntity<?> submitContact(@RequestBody ContactMessage contactMessage) {
        try {
            ContactMessage saved = contactMessageRepository.save(contactMessage);
            return ResponseEntity.ok(Map.of(
                "message", "Thank you for contacting us! We will get back to you soon.",
                "id", saved.getId()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to submit message"));
        }
    }

    // Get all messages (Admin)
    @GetMapping
    public List<ContactMessage> getAllMessages() {
        return contactMessageRepository.findAllByOrderByCreatedAtDesc();
    }

    // Mark as read (Admin)
    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        return contactMessageRepository.findById(id)
                .map(msg -> {
                    msg.setIsRead(true);
                    contactMessageRepository.save(msg);
                    return ResponseEntity.ok(msg);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Delete message (Admin)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMessage(@PathVariable Long id) {
        if (contactMessageRepository.existsById(id)) {
            contactMessageRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
