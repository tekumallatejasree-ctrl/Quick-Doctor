package com.doctorconnect.dto;

import lombok.*;

/**
 * Patient dashboard statistics.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientDashboardDto {

    private long upcomingAppointments;
    private long pastAppointments;
    private long totalDoctors;
    private long unreadNotifications;
    private long prescriptions;
}
