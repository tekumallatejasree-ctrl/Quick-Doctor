package com.doctorconnect.controller;

import com.doctorconnect.dto.*;
import com.doctorconnect.service.ConsultationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/consultations")
@Tag(name = "Consultations", description = "Clinical consultation and examination APIs")
@SecurityRequirement(name = "bearerAuth")
public class ConsultationController {

    private final ConsultationService consultationService;

    public ConsultationController(ConsultationService consultationService) {
        this.consultationService = consultationService;
    }

    @PostMapping("/start/{appointmentId}")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Start or resume consultation encounter for an appointment (Doctor only)")
    public ResponseEntity<ApiResponse<ConsultationDto>> startConsultation(
            @PathVariable Long appointmentId,
            @AuthenticationPrincipal UserDetails userDetails) {
        ConsultationDto consultation = consultationService.startOrGetConsultation(appointmentId, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Consultation started", consultation));
    }

    @PostMapping("/complete/{appointmentId}")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Complete consultation and issue prescription (Doctor only)")
    public ResponseEntity<ApiResponse<ConsultationDto>> completeConsultation(
            @PathVariable Long appointmentId,
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CompleteConsultationRequest request) {
        ConsultationDto consultation = consultationService.completeConsultation(appointmentId, userDetails.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.success("Consultation completed and prescription generated", consultation));
    }

    @GetMapping("/appointment/{appointmentId}")
    @Operation(summary = "Get consultation details for an appointment (Doctor or Patient)")
    public ResponseEntity<ApiResponse<ConsultationDto>> getConsultationByAppointment(
            @PathVariable Long appointmentId) {
        ConsultationDto consultation = consultationService.getConsultationByAppointment(appointmentId);
        return ResponseEntity.ok(ApiResponse.success("Consultation retrieved", consultation));
    }

    @GetMapping("/patient/history")
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Get consultation history for logged-in patient")
    public ResponseEntity<ApiResponse<List<ConsultationDto>>> getPatientHistory(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<ConsultationDto> history = consultationService.getPatientConsultationHistory(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Consultation history retrieved", history));
    }
}
