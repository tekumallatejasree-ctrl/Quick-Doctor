package com.doctorconnect.service;

import com.doctorconnect.dto.PrescriptionDto;
import com.doctorconnect.dto.PrescriptionMedicineDto;
import com.doctorconnect.entity.Patient;
import com.doctorconnect.entity.Prescription;
import com.doctorconnect.exception.ResourceNotFoundException;
import com.doctorconnect.repository.PatientRepository;
import com.doctorconnect.repository.PrescriptionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final PatientRepository patientRepository;

    public PrescriptionService(PrescriptionRepository prescriptionRepository,
                               PatientRepository patientRepository) {
        this.prescriptionRepository = prescriptionRepository;
        this.patientRepository = patientRepository;
    }

    /**
     * Get prescription details by ID.
     */
    @Transactional(readOnly = true)
    public PrescriptionDto getPrescriptionById(Long id) {
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription", "id", id));
        return mapToDto(prescription);
    }

    /**
     * Get prescription by consultation ID.
     */
    @Transactional(readOnly = true)
    public PrescriptionDto getPrescriptionByConsultationId(Long consultationId) {
        Prescription prescription = prescriptionRepository.findByConsultationId(consultationId)
                .orElseThrow(() -> new ResourceNotFoundException("No prescription found for consultation id: " + consultationId));
        return mapToDto(prescription);
    }

    /**
     * Get all prescriptions for logged-in patient.
     */
    @Transactional(readOnly = true)
    public List<PrescriptionDto> getPatientPrescriptions(String patientUsername) {
        Patient patient = patientRepository.findByUserUsername(patientUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found"));
        return prescriptionRepository.findByPatientIdOrderByCreatedAtDesc(patient.getId())
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public PrescriptionDto mapToDto(Prescription p) {
        List<PrescriptionMedicineDto> medicines = p.getMedicines() != null
                ? p.getMedicines().stream().map(m -> PrescriptionMedicineDto.builder()
                        .id(m.getId())
                        .medicineName(m.getMedicineName())
                        .dosage(m.getDosage())
                        .frequency(m.getFrequency())
                        .durationDays(m.getDurationDays())
                        .instructions(m.getInstructions())
                        .build()).collect(Collectors.toList())
                : Collections.emptyList();

        return PrescriptionDto.builder()
                .id(p.getId())
                .prescriptionNumber(p.getPrescriptionNumber())
                .consultationId(p.getConsultation() != null ? p.getConsultation().getId() : null)
                .appointmentId(p.getConsultation() != null && p.getConsultation().getAppointment() != null ? p.getConsultation().getAppointment().getId() : null)
                .appointmentNumber(p.getConsultation() != null && p.getConsultation().getAppointment() != null ? p.getConsultation().getAppointment().getAppointmentNumber() : null)
                .doctorId(p.getDoctor() != null ? p.getDoctor().getId() : null)
                .doctorName(p.getDoctor() != null ? p.getDoctor().getName() : "Doctor")
                .doctorSpecialization(p.getDoctor() != null ? p.getDoctor().getSpecialization() : null)
                .doctorQualification(p.getDoctor() != null ? p.getDoctor().getQualification() : null)
                .patientId(p.getPatient() != null ? p.getPatient().getId() : null)
                .patientName(p.getPatient() != null ? p.getPatient().getFullName() : "Patient")
                .patientMobile(p.getPatient() != null ? p.getPatient().getMobile() : null)
                .patientEmail(p.getPatient() != null && p.getPatient().getUser() != null ? p.getPatient().getUser().getEmail() : null)
                .adviceNotes(p.getAdviceNotes())
                .followUpDate(p.getConsultation() != null ? p.getConsultation().getFollowUpDate() : null)
                .medicines(medicines)
                .createdAt(p.getCreatedAt())
                .build();
    }
}
