package com.doctorconnect.dto;

import com.doctorconnect.entity.AppointmentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppointmentDto {
    private Long id;
    private String appointmentNumber;
    
    // Patient Info
    private Long patientId;
    private String patientName;
    private String patientMobile;
    private String patientEmail;

    // Doctor Info
    private Long doctorId;
    private String doctorName;
    private String doctorSpecialization;
    private BigDecimal consultationFee;

    // Appointment Timing & Details
    private LocalDate appointmentDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private AppointmentStatus status;
    private String reasonForVisit;
    private String rejectionReason;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
