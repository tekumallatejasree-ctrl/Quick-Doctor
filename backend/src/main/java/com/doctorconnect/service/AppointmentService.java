package com.doctorconnect.service;

import com.doctorconnect.dto.AppointmentDto;
import com.doctorconnect.dto.BookAppointmentRequest;
import com.doctorconnect.dto.DoctorDashboardDto;
import com.doctorconnect.dto.PatientDashboardDto;
import com.doctorconnect.dto.TimeSlotDto;
import com.doctorconnect.dto.UpdateAppointmentStatusRequest;
import com.doctorconnect.entity.Appointment;
import com.doctorconnect.entity.AppointmentStatus;
import com.doctorconnect.entity.Doctor;
import com.doctorconnect.entity.Patient;
import com.doctorconnect.entity.User;
import com.doctorconnect.exception.BadRequestException;
import com.doctorconnect.exception.ResourceNotFoundException;
import com.doctorconnect.repository.AppointmentRepository;
import com.doctorconnect.repository.DoctorRepository;
import com.doctorconnect.repository.NotificationRepository;
import com.doctorconnect.repository.PatientRepository;
import com.doctorconnect.repository.PrescriptionRepository;
import com.doctorconnect.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AppointmentService {

    private static final Logger logger = LoggerFactory.getLogger(AppointmentService.class);

    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final DoctorAvailabilityService availabilityService;
    private final NotificationService notificationService;
    private final NotificationRepository notificationRepository;
    private final PrescriptionRepository prescriptionRepository;

    public AppointmentService(AppointmentRepository appointmentRepository,
                              DoctorRepository doctorRepository,
                              PatientRepository patientRepository,
                              UserRepository userRepository,
                              DoctorAvailabilityService availabilityService,
                              NotificationService notificationService,
                              NotificationRepository notificationRepository,
                              PrescriptionRepository prescriptionRepository) {
        this.appointmentRepository = appointmentRepository;
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
        this.availabilityService = availabilityService;
        this.notificationService = notificationService;
        this.notificationRepository = notificationRepository;
        this.prescriptionRepository = prescriptionRepository;
    }

    /**
     * Book a new consultation appointment slot.
     */
    @Transactional
    public AppointmentDto bookAppointment(String patientUsername, BookAppointmentRequest request) {
        Patient patient = patientRepository.findByUserUsername(patientUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found for user: " + patientUsername));

        Doctor doctor = availabilityService.getPrimaryDoctor();

        LocalDate date = request.getAppointmentDate();
        LocalTime startTime = request.getStartTime();

        if (date.isBefore(LocalDate.now())) {
            throw new BadRequestException("Cannot book an appointment in the past.");
        }
        if (date.equals(LocalDate.now()) && startTime.isBefore(LocalTime.now())) {
            throw new BadRequestException("Cannot book a time slot that has already passed.");
        }

        // Verify slot is available
        List<TimeSlotDto> slots = availabilityService.getAvailableSlots(date);
        TimeSlotDto matchedSlot = slots.stream()
                .filter(s -> s.getStartTime().equals(startTime))
                .findFirst()
                .orElseThrow(() -> new BadRequestException("Selected time slot is not valid for this date."));

        if (!matchedSlot.isAvailable()) {
            throw new BadRequestException("Selected time slot is already booked or unavailable.");
        }

        LocalTime endTime = matchedSlot.getEndTime();

        String appointmentNumber = "APT-" + date.format(DateTimeFormatter.BASIC_ISO_DATE) + "-"
                + UUID.randomUUID().toString().substring(0, 6).toUpperCase();

        Appointment appointment = Appointment.builder()
                .appointmentNumber(appointmentNumber)
                .patient(patient)
                .doctor(doctor)
                .appointmentDate(date)
                .startTime(startTime)
                .endTime(endTime)
                .status(AppointmentStatus.PENDING)
                .reasonForVisit(request.getReasonForVisit())
                .build();

        appointment = appointmentRepository.save(appointment);

        // Notify Doctor
        if (doctor.getUser() != null) {
            notificationService.createNotification(
                    doctor.getUser().getId(),
                    "New Appointment Request",
                    "Patient " + patient.getFullName() + " requested a consultation on " + date + " at " + startTime,
                    "APPOINTMENT"
            );
        }

        // Notify Patient
        if (patient.getUser() != null) {
            notificationService.createNotification(
                    patient.getUser().getId(),
                    "Appointment Requested",
                    "Your appointment request (" + appointmentNumber + ") on " + date + " at " + startTime + " is pending doctor confirmation.",
                    "APPOINTMENT"
            );
        }

        return mapToDto(appointment);
    }

    /**
     * Get all appointments for a patient.
     */
    @Transactional(readOnly = true)
    public List<AppointmentDto> getPatientAppointments(String patientUsername) {
        Patient patient = patientRepository.findByUserUsername(patientUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found"));
        return appointmentRepository.findByPatientIdOrderByAppointmentDateDescStartTimeDesc(patient.getId())
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get all appointments for the doctor.
     */
    @Transactional(readOnly = true)
    public List<AppointmentDto> getDoctorAppointments(String doctorUsername) {
        Doctor doctor = doctorRepository.findByUserUsername(doctorUsername)
                .orElseGet(availabilityService::getPrimaryDoctor);
        return appointmentRepository.findByDoctorIdOrderByAppointmentDateDescStartTimeDesc(doctor.getId())
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /**
     * Update appointment status (Accept / Reject / Complete).
     */
    @Transactional
    public AppointmentDto updateStatus(Long appointmentId, String doctorUsername, UpdateAppointmentStatusRequest request) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", appointmentId));

        appointment.setStatus(request.getStatus());
        if (request.getStatus() == AppointmentStatus.REJECTED && request.getRejectionReason() != null) {
            appointment.setRejectionReason(request.getRejectionReason());
        }

        appointment = appointmentRepository.save(appointment);

        // Send alert to patient
        if (appointment.getPatient().getUser() != null) {
            String title = "Appointment " + request.getStatus().name();
            String message = request.getStatus() == AppointmentStatus.CONFIRMED
                    ? "Dr. " + appointment.getDoctor().getName() + " confirmed your appointment for " + appointment.getAppointmentDate() + " at " + appointment.getStartTime()
                    : request.getStatus() == AppointmentStatus.REJECTED
                    ? "Your appointment on " + appointment.getAppointmentDate() + " was rejected. Reason: " + (request.getRejectionReason() != null ? request.getRejectionReason() : "Schedule conflict")
                    : "Appointment marked as " + request.getStatus().name();

            notificationService.createNotification(
                    appointment.getPatient().getUser().getId(),
                    title,
                    message,
                    "APPOINTMENT"
            );
        }

        return mapToDto(appointment);
    }

    /**
     * Cancel an appointment.
     */
    @Transactional
    public AppointmentDto cancelAppointment(Long appointmentId, String username, String cancelReason) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", appointmentId));

        if (appointment.getStatus() == AppointmentStatus.COMPLETED) {
            throw new BadRequestException("Cannot cancel an already completed appointment.");
        }

        appointment.setStatus(AppointmentStatus.CANCELLED);
        if (cancelReason != null) {
            appointment.setRejectionReason("Cancelled: " + cancelReason);
        }
        appointment = appointmentRepository.save(appointment);

        // Notify counterpart
        User currentUser = userRepository.findByUsername(username).orElse(null);
        if (currentUser != null && currentUser.getRole().name().equals("PATIENT") && appointment.getDoctor().getUser() != null) {
            notificationService.createNotification(
                    appointment.getDoctor().getUser().getId(),
                    "Appointment Cancelled",
                    "Patient " + appointment.getPatient().getFullName() + " cancelled appointment " + appointment.getAppointmentNumber(),
                    "APPOINTMENT"
            );
        } else if (appointment.getPatient().getUser() != null) {
            notificationService.createNotification(
                    appointment.getPatient().getUser().getId(),
                    "Appointment Cancelled",
                    "Your appointment " + appointment.getAppointmentNumber() + " has been cancelled.",
                    "APPOINTMENT"
            );
        }

        return mapToDto(appointment);
    }

    /**
     * Get doctor dashboard real metrics.
     */
    @Transactional(readOnly = true)
    public DoctorDashboardDto getDoctorDashboard(String doctorUsername) {
        Doctor doctor = doctorRepository.findByUserUsername(doctorUsername)
                .orElseGet(availabilityService::getPrimaryDoctor);

        LocalDate today = LocalDate.now();
        long todayCount = appointmentRepository.countByDoctorIdAndAppointmentDate(doctor.getId(), today);
        long pendingCount = appointmentRepository.countByDoctorIdAndStatus(doctor.getId(), AppointmentStatus.PENDING);
        long confirmedUpcoming = appointmentRepository.countByDoctorIdAndStatus(doctor.getId(), AppointmentStatus.CONFIRMED);
        long completedCount = appointmentRepository.countByDoctorIdAndStatus(doctor.getId(), AppointmentStatus.COMPLETED);
        long cancelledCount = appointmentRepository.countByDoctorIdAndStatus(doctor.getId(), AppointmentStatus.CANCELLED);

        long unreadNotifs = 0;
        if (doctor.getUser() != null) {
            unreadNotifs = notificationRepository.countByUserIdAndIsReadFalse(doctor.getUser().getId());
        }

        return DoctorDashboardDto.builder()
                .todayAppointments(todayCount)
                .pendingVerification(pendingCount)
                .upcomingAppointments(confirmedUpcoming)
                .completedConsultations(completedCount)
                .cancelledAppointments(cancelledCount)
                .unreadNotifications(unreadNotifs)
                .build();
    }

    /**
     * Get patient dashboard real metrics.
     */
    @Transactional(readOnly = true)
    public PatientDashboardDto getPatientDashboard(String patientUsername) {
        Patient patient = patientRepository.findByUserUsername(patientUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found"));

        LocalDate today = LocalDate.now();
        long upcoming = appointmentRepository.countByPatientIdAndAppointmentDateGreaterThanEqualAndStatusIn(
                patient.getId(), today, List.of(AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED));
        long past = appointmentRepository.countByPatientIdAndAppointmentDateLessThan(patient.getId(), today);
        
        long unreadNotifs = 0;
        if (patient.getUser() != null) {
            unreadNotifs = notificationRepository.countByUserIdAndIsReadFalse(patient.getUser().getId());
        }

        long prescriptionsCount = prescriptionRepository.countByPatientId(patient.getId());

        return PatientDashboardDto.builder()
                .upcomingAppointments(upcoming)
                .pastAppointments(past)
                .totalDoctors(1L)
                .unreadNotifications(unreadNotifs)
                .prescriptions(prescriptionsCount)
                .build();
    }

    private AppointmentDto mapToDto(Appointment a) {
        return AppointmentDto.builder()
                .id(a.getId())
                .appointmentNumber(a.getAppointmentNumber())
                .patientId(a.getPatient() != null ? a.getPatient().getId() : null)
                .patientName(a.getPatient() != null ? a.getPatient().getFullName() : "Unknown")
                .patientMobile(a.getPatient() != null ? a.getPatient().getMobile() : null)
                .patientEmail(a.getPatient() != null && a.getPatient().getUser() != null ? a.getPatient().getUser().getEmail() : null)
                .doctorId(a.getDoctor() != null ? a.getDoctor().getId() : null)
                .doctorName(a.getDoctor() != null ? a.getDoctor().getName() : "Doctor")
                .doctorSpecialization(a.getDoctor() != null ? a.getDoctor().getSpecialization() : null)
                .consultationFee(a.getDoctor() != null ? a.getDoctor().getConsultationFee() : null)
                .appointmentDate(a.getAppointmentDate())
                .startTime(a.getStartTime())
                .endTime(a.getEndTime())
                .status(a.getStatus())
                .reasonForVisit(a.getReasonForVisit())
                .rejectionReason(a.getRejectionReason())
                .createdAt(a.getCreatedAt())
                .updatedAt(a.getUpdatedAt())
                .build();
    }
}
