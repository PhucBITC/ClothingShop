package com.ecommerShop.clothingsystem.service.impl;

import com.ecommerShop.clothingsystem.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.scheduling.annotation.Async;

@Service
public class EmailServiceImpl implements EmailService {

    @Autowired
    private JavaMailSender emailSender;

    @Override
    @Async
    public void sendHtmlMessage(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("phucxo262@gmail.com");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true); // true indicates HTML

            emailSender.send(message);
            System.out.println("HTML Email sent successfully to " + to);
        } catch (MessagingException e) {
            System.err.println("Error sending HTML email: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
