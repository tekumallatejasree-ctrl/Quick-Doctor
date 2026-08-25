package com.doctorconnect.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

/**
 * Email service for sending OTP and notification emails via Gmail SMTP.
 */
@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Send OTP verification email.
     */
    @Async
    public void sendOtpEmail(String toEmail, String otp, String fullName) {
        String subject = "DoctorConnect - Email Verification OTP";
        String htmlContent = """
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto;
                            background: #ffffff; border-radius: 12px; overflow: hidden;
                            box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                    <div style="background: linear-gradient(135deg, #2563EB, #1d4ed8); padding: 32px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 28px;">DoctorConnect</h1>
                        <p style="color: #dbeafe; margin: 8px 0 0; font-size: 14px;">Secure Telemedicine Platform</p>
                    </div>
                    <div style="padding: 32px;">
                        <h2 style="color: #1e293b; margin: 0 0 16px;">Email Verification</h2>
                        <p style="color: #475569; font-size: 15px; line-height: 1.6;">
                            Hello <strong>%s</strong>,
                        </p>
                        <p style="color: #475569; font-size: 15px; line-height: 1.6;">
                            Thank you for registering with DoctorConnect. Please use the following OTP to verify your email address:
                        </p>
                        <div style="text-align: center; margin: 32px 0;">
                            <div style="display: inline-block; background: #f1f5f9; border: 2px dashed #2563EB;
                                        border-radius: 12px; padding: 20px 40px;">
                                <span style="font-size: 36px; font-weight: 700; color: #2563EB; letter-spacing: 8px;">%s</span>
                            </div>
                        </div>
                        <p style="color: #94a3b8; font-size: 13px; text-align: center;">
                            This OTP is valid for <strong>10 minutes</strong>. Do not share it with anyone.
                        </p>
                    </div>
                    <div style="background: #f8fafc; padding: 20px 32px; text-align: center; border-top: 1px solid #e2e8f0;">
                        <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                            &copy; 2024 DoctorConnect. All rights reserved.
                        </p>
                    </div>
                </div>
                """.formatted(fullName, otp);

        sendHtmlEmail(toEmail, subject, htmlContent);
    }

    /**
     * Send a generic notification email.
     */
    @Async
    public void sendNotificationEmail(String toEmail, String subject, String htmlContent) {
        sendHtmlEmail(toEmail, subject, htmlContent);
    }

    /**
     * Internal method to send HTML email.
     */
    private void sendHtmlEmail(String toEmail, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            mailSender.send(message);
            logger.info("Email sent successfully to: {}", toEmail);
        } catch (MessagingException e) {
            logger.error("Failed to send email to {}: {}", toEmail, e.getMessage());
        }
    }
}
