package com.doctorconnect.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompleteConsultationRequest {

    private String symptoms;

    @NotBlank(message = "Diagnosis / Assessment is required")
    private String diagnosis;

    private String clinicalNotes;

    private LocalDate followUpDate;

    private String adviceNotes;

    @Valid
    private List<PrescriptionMedicineDto> medicines;
}
