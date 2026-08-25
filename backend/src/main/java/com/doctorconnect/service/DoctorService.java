package com.doctorconnect.service;

import com.doctorconnect.dto.*;
import com.doctorconnect.entity.Doctor;
import com.doctorconnect.entity.User;
import com.doctorconnect.exception.ResourceNotFoundException;
import com.doctorconnect.repository.DoctorRepository;
import com.doctorconnect.repository.NotificationRepository;
import com.doctorconnect.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service for doctor profile and dashboard operations.
 */
@Service
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;

    public DoctorService(DoctorRepository doctorRepository,
                         UserRepository userRepository,
                         NotificationRepository notificationRepository) {
        this.doctorRepository = doctorRepository;
        this.userRepository = userRepository;
        this.notificationRepository = notificationRepository;
    }

    /**
     * Get the single primary clinic doctor public profile.
     */
    @Transactional(readOnly = true)
    public DoctorProfileDto getPublicProfile() {
        Doctor doctor = doctorRepository.findAll().stream()
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("No clinic doctor found in the system."));
        return toDoctorDto(doctor);
    }

    /**
     * Get doctor profile by username.
     */
    @Transactional(readOnly = true)
    public DoctorProfileDto getProfile(String username) {
        User user = getUserByUsername(username);
        Doctor doctor = doctorRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "userId", user.getId()));

        return toDoctorDto(doctor);
    }

    /**
     * Update doctor profile.
     */
    @Transactional
    public DoctorProfileDto updateProfile(String username, UpdateDoctorProfileRequest request) {
        User user = getUserByUsername(username);
        Doctor doctor = doctorRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "userId", user.getId()));

        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            doctor.setName(request.getName().trim());
        }
        if (request.getQualification() != null) doctor.setQualification(request.getQualification());
        if (request.getSpecialization() != null) doctor.setSpecialization(request.getSpecialization());
        if (request.getExperience() != null) doctor.setExperience(request.getExperience());
        if (request.getConsultationFee() != null) doctor.setConsultationFee(request.getConsultationFee());
        if (request.getLanguagesKnown() != null) doctor.setLanguagesKnown(request.getLanguagesKnown());
        if (request.getUpiId() != null) doctor.setUpiId(request.getUpiId());
        if (request.getBio() != null) doctor.setBio(request.getBio());
        if (request.getMobile() != null) doctor.setMobile(request.getMobile());

        doctor = doctorRepository.save(doctor);
        return toDoctorDto(doctor);
    }

    /**
     * Get doctor dashboard statistics.
     */
    @Transactional(readOnly = true)
    public DoctorDashboardDto getDashboard(String username) {
        User user = getUserByUsername(username);
        long unreadNotifications = notificationRepository.countByUserIdAndIsReadFalse(user.getId());

        return DoctorDashboardDto.builder()
                .todayAppointments(0)
                .pendingVerification(0)
                .upcomingAppointments(0)
                .completedConsultations(0)
                .cancelledAppointments(0)
                .unreadNotifications(unreadNotifications)
                .build();
    }

    public DoctorProfileDto toDoctorDto(Doctor doctor) {
        return DoctorProfileDto.builder()
                .id(doctor.getId())
                .name(doctor.getName())
                .username(doctor.getUser() != null ? doctor.getUser().getUsername() : null)
                .email(doctor.getEmail())
                .qualification(doctor.getQualification())
                .specialization(doctor.getSpecialization())
                .experience(doctor.getExperience())
                .consultationFee(doctor.getConsultationFee())
                .mobile(doctor.getMobile())
                .photo(doctor.getPhoto())
                .languagesKnown(doctor.getLanguagesKnown())
                .upiId(doctor.getUpiId())
                .bio(doctor.getBio())
                .build();
    }

    private User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
    }
}
