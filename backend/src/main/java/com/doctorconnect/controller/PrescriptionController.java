package com.doctorconnect.controller;

import com.doctorconnect.dto.*;
import com.doctorconnect.service.PrescriptionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/prescriptions")
@Tag(name = "Prescriptions", description = "Digital prescription APIs")
@SecurityRequirement(name = "bearerAuth")
public class PrescriptionController {

    private final PrescriptionService prescriptionService;

    public PrescriptionController(PrescriptionService prescriptionService) {
        this.prescriptionService = prescriptionService;
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get prescription details by ID (Doctor or Patient)")
    public ResponseEntity<ApiResponse<PrescriptionDto>> getPrescriptionById(@PathVariable Long id) {
        PrescriptionDto prescription = prescriptionService.getPrescriptionById(id);
        return ResponseEntity.ok(ApiResponse.success("Prescription retrieved", prescription));
    }

    @GetMapping("/consultation/{consultationId}")
    @Operation(summary = "Get prescription for a consultation (Doctor or Patient)")
    public ResponseEntity<ApiResponse<PrescriptionDto>> getPrescriptionByConsultationId(
            @PathVariable Long consultationId) {
        PrescriptionDto prescription = prescriptionService.getPrescriptionByConsultationId(consultationId);
        return ResponseEntity.ok(ApiResponse.success("Prescription retrieved", prescription));
    }

    @GetMapping("/patient/my-prescriptions")
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Get all prescriptions for logged-in patient")
    public ResponseEntity<ApiResponse<List<PrescriptionDto>>> getMyPrescriptions(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<PrescriptionDto> prescriptions = prescriptionService.getPatientPrescriptions(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Prescriptions retrieved", prescriptions));
    }
}
