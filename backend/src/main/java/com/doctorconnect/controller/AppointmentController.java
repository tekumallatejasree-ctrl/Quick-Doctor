package com.doctorconnect.controller;

import com.doctorconnect.dto.*;
import com.doctorconnect.service.AppointmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/appointments")
@Tag(name = "Appointments", description = "Appointment booking and management APIs")
@SecurityRequirement(name = "bearerAuth")
public class AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @PostMapping("/book")
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Book a consultation slot (Patient only)")
    public ResponseEntity<ApiResponse<AppointmentDto>> bookAppointment(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody BookAppointmentRequest request) {
        AppointmentDto appointment = appointmentService.bookAppointment(userDetails.getUsername(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Appointment booked successfully", appointment));
    }

    @GetMapping("/my-appointments")
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Get all appointments for logged-in patient")
    public ResponseEntity<ApiResponse<List<AppointmentDto>>> getMyAppointments(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<AppointmentDto> appointments = appointmentService.getPatientAppointments(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Appointments retrieved", appointments));
    }

    @GetMapping("/doctor/all")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Get all appointment requests for doctor")
    public ResponseEntity<ApiResponse<List<AppointmentDto>>> getDoctorAppointments(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<AppointmentDto> appointments = appointmentService.getDoctorAppointments(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Doctor appointments retrieved", appointments));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Update appointment status - Accept, Reject, Complete (Doctor only)")
    public ResponseEntity<ApiResponse<AppointmentDto>> updateStatus(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UpdateAppointmentStatusRequest request) {
        AppointmentDto updated = appointmentService.updateStatus(id, userDetails.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.success("Appointment status updated to " + request.getStatus(), updated));
    }

    @PatchMapping("/{id}/cancel")
    @Operation(summary = "Cancel an appointment (Patient or Doctor)")
    public ResponseEntity<ApiResponse<AppointmentDto>> cancelAppointment(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody(required = false) Map<String, String> body) {
        String reason = body != null ? body.get("reason") : null;
        AppointmentDto cancelled = appointmentService.cancelAppointment(id, userDetails.getUsername(), reason);
        return ResponseEntity.ok(ApiResponse.success("Appointment cancelled", cancelled));
    }
}
