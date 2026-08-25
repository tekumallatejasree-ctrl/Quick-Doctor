package com.doctorconnect.service;

import com.doctorconnect.dto.*;
import com.doctorconnect.entity.Doctor;
import com.doctorconnect.entity.Patient;
import com.doctorconnect.entity.User;
import com.doctorconnect.exception.ResourceNotFoundException;
import com.doctorconnect.repository.DoctorRepository;
import com.doctorconnect.repository.NotificationRepository;
import com.doctorconnect.repository.PatientRepository;
import com.doctorconnect.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for patient profile and dashboard operations.
 */
@Service
public class PatientService {

    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final NotificationRepository notificationRepository;

    public PatientService(PatientRepository patientRepository,
                          UserRepository userRepository,
                          DoctorRepository doctorRepository,
                          NotificationRepository notificationRepository) {
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
        this.doctorRepository = doctorRepository;
        this.notificationRepository = notificationRepository;
    }

    /**
     * Get patient profile by username.
     */
    @Transactional(readOnly = true)
    public PatientProfileDto getProfile(String username) {
        User user = getUserByUsername(username);
        Patient patient = patientRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "userId", user.getId()));

        return PatientProfileDto.builder()
                .id(patient.getId())
                .fullName(patient.getFullName())
                .username(user.getUsername())
                .email(user.getEmail())
                .mobile(patient.getMobile())
                .address(patient.getAddress())
                .profilePicture(patient.getProfilePicture())
                .emergencyContact(patient.getEmergencyContact())
                .build();
    }

    /**
     * Update patient profile.
     */
    @Transactional
    public PatientProfileDto updateProfile(String username, UpdatePatientProfileRequest request) {
        User user = getUserByUsername(username);
        Patient patient = patientRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "userId", user.getId()));

        if (request.getFullName() != null) patient.setFullName(request.getFullName());
        if (request.getMobile() != null) patient.setMobile(request.getMobile());
        if (request.getAddress() != null) patient.setAddress(request.getAddress());
        if (request.getEmergencyContact() != null) patient.setEmergencyContact(request.getEmergencyContact());

        patient = patientRepository.save(patient);

        return PatientProfileDto.builder()
                .id(patient.getId())
                .fullName(patient.getFullName())
                .username(user.getUsername())
                .email(user.getEmail())
                .mobile(patient.getMobile())
                .address(patient.getAddress())
                .profilePicture(patient.getProfilePicture())
                .emergencyContact(patient.getEmergencyContact())
                .build();
    }

    /**
     * Get patient dashboard statistics.
     */
    @Transactional(readOnly = true)
    public PatientDashboardDto getDashboard(String username) {
        User user = getUserByUsername(username);

        long totalDoctors = doctorRepository.count();
        long unreadNotifications = notificationRepository.countByUserIdAndIsReadFalse(user.getId());

        // In Phase 1, appointment and prescription counts are 0 (will be populated in later phases)
        return PatientDashboardDto.builder()
                .upcomingAppointments(0)
                .pastAppointments(0)
                .totalDoctors(totalDoctors)
                .unreadNotifications(unreadNotifications)
                .prescriptions(0)
                .build();
    }

    /**
     * Get list of all active doctors.
     */
    @Transactional(readOnly = true)
    public List<DoctorProfileDto> getAvailableDoctors() {
        return doctorRepository.findByUserIsActiveTrue()
                .stream()
                .map(this::toDoctorDto)
                .collect(Collectors.toList());
    }

    private DoctorProfileDto toDoctorDto(Doctor doctor) {
        return DoctorProfileDto.builder()
                .id(doctor.getId())
                .name(doctor.getName())
                .username(doctor.getUser().getUsername())
                .email(doctor.getEmail())
                .qualification(doctor.getQualification())
                .specialization(doctor.getSpecialization())
                .experience(doctor.getExperience())
                .consultationFee(doctor.getConsultationFee())
                .mobile(doctor.getMobile())
                .photo(doctor.getPhoto())
                .languagesKnown(doctor.getLanguagesKnown())
                .bio(doctor.getBio())
                .build();
    }

    private User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
    }
}
