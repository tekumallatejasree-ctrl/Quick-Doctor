package com.doctorconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConsultationDto {
    private Long id;
    private Long appointmentId;
    private String appointmentNumber;

    // Doctor info
    private Long doctorId;
    private String doctorName;
    private String doctorSpecialization;

    // Patient info
    private Long patientId;
    private String patientName;
    private String patientMobile;

    private String symptoms;
    private String diagnosis;
    private String clinicalNotes;
    private LocalDate followUpDate;
    private String status;

    private PrescriptionDto prescription;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
