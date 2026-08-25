package com.doctorconnect.service;

import com.doctorconnect.dto.*;
import com.doctorconnect.entity.*;
import com.doctorconnect.exception.BadRequestException;
import com.doctorconnect.exception.ResourceNotFoundException;
import com.doctorconnect.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ConsultationService {

    private final ConsultationRepository consultationRepository;
    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final PrescriptionMedicineRepository medicineRepository;
    private final NotificationService notificationService;
    private final PrescriptionService prescriptionService;

    public ConsultationService(ConsultationRepository consultationRepository,
                               AppointmentRepository appointmentRepository,
                               DoctorRepository doctorRepository,
                               PatientRepository patientRepository,
                               PrescriptionRepository prescriptionRepository,
                               PrescriptionMedicineRepository medicineRepository,
                               NotificationService notificationService,
                               PrescriptionService prescriptionService) {
        this.consultationRepository = consultationRepository;
        this.appointmentRepository = appointmentRepository;
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
        this.prescriptionRepository = prescriptionRepository;
        this.medicineRepository = medicineRepository;
        this.notificationService = notificationService;
        this.prescriptionService = prescriptionService;
    }

    /**
     * Start or initialize a consultation encounter for a confirmed appointment.
     */
    @Transactional
    public ConsultationDto startOrGetConsultation(Long appointmentId, String doctorUsername) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", appointmentId));

        if (appointment.getStatus() == AppointmentStatus.CANCELLED || appointment.getStatus() == AppointmentStatus.REJECTED) {
            throw new BadRequestException("Cannot conduct consultation for a cancelled or rejected appointment.");
        }

        Consultation consultation = consultationRepository.findByAppointmentId(appointmentId)
                .orElseGet(() -> {
                    Consultation c = Consultation.builder()
                            .appointment(appointment)
                            .patient(appointment.getPatient())
                            .doctor(appointment.getDoctor())
                            .symptoms(appointment.getReasonForVisit())
                            .status("IN_PROGRESS")
                            .build();
                    return consultationRepository.save(c);
                });

        return mapToDto(consultation);
    }

    /**
     * Complete the consultation with diagnosis, clinical notes, follow-up, and prescription.
     */
    @Transactional
    public ConsultationDto completeConsultation(Long appointmentId, String doctorUsername, CompleteConsultationRequest request) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", appointmentId));

        Consultation consultation = consultationRepository.findByAppointmentId(appointmentId)
                .orElseGet(() -> Consultation.builder()
                        .appointment(appointment)
                        .patient(appointment.getPatient())
                        .doctor(appointment.getDoctor())
                        .build());

        consultation.setSymptoms(request.getSymptoms());
        consultation.setDiagnosis(request.getDiagnosis());
        consultation.setClinicalNotes(request.getClinicalNotes());
        consultation.setFollowUpDate(request.getFollowUpDate());
        consultation.setStatus("COMPLETED");

        final Consultation savedConsultation = consultationRepository.save(consultation);

        // Mark appointment as COMPLETED
        appointment.setStatus(AppointmentStatus.COMPLETED);
        appointmentRepository.save(appointment);

        // Create or update prescription if medicines or advice are present
        if ((request.getMedicines() != null && !request.getMedicines().isEmpty()) || request.getAdviceNotes() != null) {
            Prescription prescription = prescriptionRepository.findByConsultationId(savedConsultation.getId())
                    .orElseGet(() -> {
                        String rxNumber = "RX-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
                        return Prescription.builder()
                                .consultation(savedConsultation)
                                .patient(appointment.getPatient())
                                .doctor(appointment.getDoctor())
                                .prescriptionNumber(rxNumber)
                                .medicines(new ArrayList<>())
                                .build();
                    });

            prescription.setAdviceNotes(request.getAdviceNotes());
            prescription = prescriptionRepository.save(prescription);

            // Replace medicines
            if (prescription.getMedicines() != null && !prescription.getMedicines().isEmpty()) {
                medicineRepository.deleteAll(prescription.getMedicines());
                prescription.getMedicines().clear();
            }

            if (request.getMedicines() != null) {
                List<PrescriptionMedicine> items = new ArrayList<>();
                for (PrescriptionMedicineDto mDto : request.getMedicines()) {
                    if (mDto.getMedicineName() == null || mDto.getMedicineName().trim().isEmpty()) continue;
                    PrescriptionMedicine med = PrescriptionMedicine.builder()
                            .prescription(prescription)
                            .medicineName(mDto.getMedicineName().trim())
                            .dosage(mDto.getDosage())
                            .frequency(mDto.getFrequency())
                            .durationDays(mDto.getDurationDays() != null ? mDto.getDurationDays() : 3)
                            .instructions(mDto.getInstructions())
                            .build();
                    items.add(medicineRepository.save(med));
                }
                prescription.setMedicines(items);
            }
            savedConsultation.setPrescription(prescription);
        }

        // Notify patient
        if (appointment.getPatient().getUser() != null) {
            notificationService.createNotification(
                    appointment.getPatient().getUser().getId(),
                    "Consultation Completed",
                    "Dr. " + appointment.getDoctor().getName() + " completed your consultation. Your diagnosis and prescription are available.",
                    "PRESCRIPTION"
            );
        }

        return mapToDto(savedConsultation);
    }

    /**
     * Get consultation details for an appointment.
     */
    @Transactional(readOnly = true)
    public ConsultationDto getConsultationByAppointment(Long appointmentId) {
        Consultation consultation = consultationRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("No consultation record found for appointment id: " + appointmentId));
        return mapToDto(consultation);
    }

    /**
     * Get all consultation history for a patient.
     */
    @Transactional(readOnly = true)
    public List<ConsultationDto> getPatientConsultationHistory(String patientUsername) {
        Patient patient = patientRepository.findByUserUsername(patientUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));
        return consultationRepository.findByPatientIdOrderByCreatedAtDesc(patient.getId())
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public ConsultationDto mapToDto(Consultation c) {
        PrescriptionDto rxDto = null;
        if (c.getPrescription() != null) {
            rxDto = prescriptionService.mapToDto(c.getPrescription());
        }

        return ConsultationDto.builder()
                .id(c.getId())
                .appointmentId(c.getAppointment() != null ? c.getAppointment().getId() : null)
                .appointmentNumber(c.getAppointment() != null ? c.getAppointment().getAppointmentNumber() : null)
                .doctorId(c.getDoctor() != null ? c.getDoctor().getId() : null)
                .doctorName(c.getDoctor() != null ? c.getDoctor().getName() : "Doctor")
                .doctorSpecialization(c.getDoctor() != null ? c.getDoctor().getSpecialization() : null)
                .patientId(c.getPatient() != null ? c.getPatient().getId() : null)
                .patientName(c.getPatient() != null ? c.getPatient().getFullName() : "Patient")
                .patientMobile(c.getPatient() != null ? c.getPatient().getMobile() : null)
                .symptoms(c.getSymptoms())
                .diagnosis(c.getDiagnosis())
                .clinicalNotes(c.getClinicalNotes())
                .followUpDate(c.getFollowUpDate())
                .status(c.getStatus())
                .prescription(rxDto)
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build();
    }
}
