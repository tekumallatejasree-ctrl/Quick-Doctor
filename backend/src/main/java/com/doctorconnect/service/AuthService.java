package com.doctorconnect.service;

import com.doctorconnect.dto.*;
import com.doctorconnect.entity.*;
import com.doctorconnect.exception.BadRequestException;
import com.doctorconnect.exception.ResourceNotFoundException;
import com.doctorconnect.repository.PatientRepository;
import com.doctorconnect.repository.UserRepository;
import com.doctorconnect.security.JwtTokenProvider;
import com.doctorconnect.util.AppConstants;
import com.doctorconnect.util.OtpGenerator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Authentication service — registration, OTP verification, login.
 */
@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final EmailService emailService;
    private final NotificationService notificationService;

    @Value("${app.otp.expiration-minutes}")
    private int otpExpirationMinutes;

    public AuthService(UserRepository userRepository,
                       PatientRepository patientRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtTokenProvider jwtTokenProvider,
                       EmailService emailService,
                       NotificationService notificationService) {
        this.userRepository = userRepository;
        this.patientRepository = patientRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtTokenProvider = jwtTokenProvider;
        this.emailService = emailService;
        this.notificationService = notificationService;
    }

    /**
     * Register a new patient.
     */
    @Transactional
    public ApiResponse<Void> register(RegisterRequest request) {
        // Validate passwords match
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Passwords do not match");
        }

        // Check if username already exists
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username is already taken");
        }

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered");
        }

        // Generate OTP
        String otp = OtpGenerator.generateOtp();

        // Create User
        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.PATIENT)
                .isVerified(false)
                .isActive(true)
                .otp(otp)
                .otpExpiry(LocalDateTime.now().plusMinutes(otpExpirationMinutes))
                .build();
        user = userRepository.save(user);

        // Create Patient profile
        Patient patient = Patient.builder()
                .user(user)
                .fullName(request.getFullName())
                .mobile(request.getMobile())
                .build();
        patientRepository.save(patient);

        // Send OTP email
        emailService.sendOtpEmail(request.getEmail(), otp, request.getFullName());

        logger.info("Patient registered successfully: {}", request.getUsername());
        return ApiResponse.success("Registration successful. Please verify your email with the OTP sent.");
    }

    /**
     * Verify email with OTP.
     */
    @Transactional
    public ApiResponse<Void> verifyOtp(OtpVerifyRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", request.getEmail()));

        if (user.isVerified()) {
            throw new BadRequestException("Email is already verified");
        }

        if (user.getOtp() == null || !user.getOtp().equals(request.getOtp())) {
            throw new BadRequestException("Invalid OTP");
        }

        if (user.getOtpExpiry() != null && user.getOtpExpiry().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("OTP has expired. Please request a new one.");
        }

        // Mark as verified
        user.setVerified(true);
        user.setOtp(null);
        user.setOtpExpiry(null);
        userRepository.save(user);

        // Create welcome notification
        notificationService.createNotification(
                user.getId(),
                "Welcome to DoctorConnect!",
                "Your email has been verified successfully. You can now login and book appointments.",
                AppConstants.NOTIF_REGISTRATION
        );

        logger.info("Email verified for user: {}", user.getUsername());
        return ApiResponse.success("Email verified successfully. You can now login.");
    }

    /**
     * Resend OTP.
     */
    @Transactional
    public ApiResponse<Void> resendOtp(ResendOtpRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", request.getEmail()));

        if (user.isVerified()) {
            throw new BadRequestException("Email is already verified");
        }

        // Generate new OTP
        String otp = OtpGenerator.generateOtp();
        user.setOtp(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(otpExpirationMinutes));
        userRepository.save(user);

        // Get patient name for email
        String fullName = patientRepository.findByUser(user)
                .map(Patient::getFullName)
                .orElse(user.getUsername());

        // Send OTP email
        emailService.sendOtpEmail(request.getEmail(), otp, fullName);

        logger.info("OTP resent for: {}", request.getEmail());
        return ApiResponse.success("OTP has been resent to your email.");
    }

    /**
     * Login user (Patient or Doctor).
     */
    public AuthResponse login(LoginRequest request) {
        // Check if user exists
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BadRequestException("Invalid username or password"));

        // Check if email is verified (only for patients)
        if (user.getRole() == Role.PATIENT && !user.isVerified()) {
            throw new BadRequestException("Please verify your email before logging in");
        }

        // Authenticate
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(), request.getPassword())
        );

        // Generate JWT
        String token = jwtTokenProvider.generateToken(authentication, request.isRememberMe());

        logger.info("User logged in: {}", request.getUsername());

        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .username(user.getUsername())
                .role(user.getRole().name())
                .message("Login successful")
                .build();
    }
}
