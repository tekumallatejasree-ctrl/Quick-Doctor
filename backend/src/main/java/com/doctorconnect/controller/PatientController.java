package com.doctorconnect.controller;

import com.doctorconnect.dto.*;
import com.doctorconnect.service.AppointmentService;
import com.doctorconnect.service.PatientService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Patient controller — profile, dashboard, doctors list.
 */
@RestController
@RequestMapping("/api/patient")
@Tag(name = "Patient", description = "Patient Profile and Dashboard APIs")
@SecurityRequirement(name = "bearerAuth")
public class PatientController {

    private final PatientService patientService;
    private final AppointmentService appointmentService;

    public PatientController(PatientService patientService, AppointmentService appointmentService) {
        this.patientService = patientService;
        this.appointmentService = appointmentService;
    }

    @GetMapping("/profile")
    @Operation(summary = "Get patient profile")
    public ResponseEntity<ApiResponse<PatientProfileDto>> getProfile(
            @AuthenticationPrincipal UserDetails userDetails) {
        PatientProfileDto profile = patientService.getProfile(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Profile retrieved", profile));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update patient profile")
    public ResponseEntity<ApiResponse<PatientProfileDto>> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody UpdatePatientProfileRequest request) {
        PatientProfileDto profile = patientService.updateProfile(userDetails.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated", profile));
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Get patient dashboard statistics")
    public ResponseEntity<ApiResponse<PatientDashboardDto>> getDashboard(
            @AuthenticationPrincipal UserDetails userDetails) {
        PatientDashboardDto dashboard = appointmentService.getPatientDashboard(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Dashboard retrieved", dashboard));
    }

    @GetMapping("/doctors")
    @Operation(summary = "Get list of available doctors")
    public ResponseEntity<ApiResponse<List<DoctorProfileDto>>> getDoctors() {
        List<DoctorProfileDto> doctors = patientService.getAvailableDoctors();
        return ResponseEntity.ok(ApiResponse.success("Doctors retrieved", doctors));
    }
}
