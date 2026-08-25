package com.doctorconnect.dto;

import lombok.*;

/**
 * Doctor dashboard statistics.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorDashboardDto {

    private long todayAppointments;
    private long pendingVerification;
    private long upcomingAppointments;
    private long completedConsultations;
    private long cancelledAppointments;
    private long unreadNotifications;
}
