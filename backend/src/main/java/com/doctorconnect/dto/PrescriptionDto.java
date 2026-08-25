package com.doctorconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrescriptionDto {
    private Long id;
    private String prescriptionNumber;
    private Long consultationId;
    private Long appointmentId;
    private String appointmentNumber;

    // Doctor info
    private Long doctorId;
    private String doctorName;
    private String doctorSpecialization;
    private String doctorQualification;

    // Patient info
    private Long patientId;
    private String patientName;
    private String patientMobile;
    private String patientEmail;

    private String adviceNotes;
    private LocalDate followUpDate;
    private List<PrescriptionMedicineDto> medicines;
    private LocalDateTime createdAt;
}
