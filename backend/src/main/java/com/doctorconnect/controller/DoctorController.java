package com.doctorconnect.controller;

import com.doctorconnect.dto.*;
import com.doctorconnect.service.AppointmentService;
import com.doctorconnect.service.DoctorAvailabilityService;
import com.doctorconnect.service.DoctorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * Doctor controller — profile, dashboard, availability schedules and open slots.
 */
@RestController
@RequestMapping("/api/doctor")
@Tag(name = "Doctor", description = "Doctor Profile, Schedule Availability and Dashboard APIs")
public class DoctorController {

    private final DoctorService doctorService;
    private final DoctorAvailabilityService availabilityService;
    private final AppointmentService appointmentService;

    public DoctorController(DoctorService doctorService,
                            DoctorAvailabilityService availabilityService,
                            AppointmentService appointmentService) {
        this.doctorService = doctorService;
        this.availabilityService = availabilityService;
        this.appointmentService = appointmentService;
    }

    @GetMapping("/public-profile")
    @Operation(summary = "Get the clinic doctor's public profile")
    public ResponseEntity<ApiResponse<DoctorProfileDto>> getPublicDoctorProfile() {
        DoctorProfileDto profile = doctorService.getPublicProfile();
        return ResponseEntity.ok(ApiResponse.success("Doctor profile retrieved", profile));
    }

    @GetMapping("/profile")
    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Get logged-in doctor profile")
    public ResponseEntity<ApiResponse<DoctorProfileDto>> getProfile(
            @AuthenticationPrincipal UserDetails userDetails) {
        DoctorProfileDto profile = doctorService.getProfile(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Profile retrieved", profile));
    }

    @PutMapping("/profile")
    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Update doctor profile")
    public ResponseEntity<ApiResponse<DoctorProfileDto>> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody UpdateDoctorProfileRequest request) {
        DoctorProfileDto profile = doctorService.updateProfile(userDetails.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated", profile));
    }

    @GetMapping("/dashboard")
    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Get doctor dashboard statistics")
    public ResponseEntity<ApiResponse<DoctorDashboardDto>> getDashboard(
            @AuthenticationPrincipal UserDetails userDetails) {
        DoctorDashboardDto dashboard = appointmentService.getDoctorDashboard(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Dashboard retrieved", dashboard));
    }

    @GetMapping("/availability")
    @Operation(summary = "Get doctor weekly schedule & slot configuration")
    public ResponseEntity<ApiResponse<List<DoctorAvailabilityDto>>> getAvailability() {
        List<DoctorAvailabilityDto> schedules = availabilityService.getAvailability();
        return ResponseEntity.ok(ApiResponse.success("Availability schedule retrieved", schedules));
    }

    @PutMapping("/availability")
    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Set or update doctor weekly schedule (Doctor only)")
    public ResponseEntity<ApiResponse<List<DoctorAvailabilityDto>>> setAvailability(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody SetAvailabilityRequest request) {
        List<DoctorAvailabilityDto> updated = availabilityService.setAvailability(userDetails.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.success("Availability schedule updated", updated));
    }

    @GetMapping("/available-slots")
    @Operation(summary = "Get available time slots for a given date")
    public ResponseEntity<ApiResponse<List<TimeSlotDto>>> getAvailableSlots(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<TimeSlotDto> slots = availabilityService.getAvailableSlots(date);
        return ResponseEntity.ok(ApiResponse.success("Available slots retrieved", slots));
    }
}
