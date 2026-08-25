package com.doctorconnect.repository;

import com.doctorconnect.entity.Appointment;
import com.doctorconnect.entity.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByPatientIdOrderByAppointmentDateDescStartTimeDesc(Long patientId);

    List<Appointment> findByDoctorIdOrderByAppointmentDateDescStartTimeDesc(Long doctorId);

    List<Appointment> findByDoctorIdAndAppointmentDate(Long doctorId, LocalDate appointmentDate);

    List<Appointment> findByDoctorIdAndAppointmentDateAndStatusIn(
            Long doctorId, LocalDate appointmentDate, List<AppointmentStatus> statuses);

    boolean existsByDoctorIdAndAppointmentDateAndStartTimeAndStatusIn(
            Long doctorId, LocalDate appointmentDate, LocalTime startTime, List<AppointmentStatus> statuses);

    long countByDoctorIdAndAppointmentDate(Long doctorId, LocalDate appointmentDate);

    long countByDoctorIdAndStatus(Long doctorId, AppointmentStatus status);

    long countByPatientIdAndStatus(Long patientId, AppointmentStatus status);

    long countByPatientIdAndAppointmentDateGreaterThanEqualAndStatusIn(
            Long patientId, LocalDate date, List<AppointmentStatus> statuses);

    long countByPatientIdAndAppointmentDateLessThan(Long patientId, LocalDate date);

    Optional<Appointment> findTopByPatientIdAndAppointmentDateGreaterThanEqualAndStatusInOrderByAppointmentDateAscStartTimeAsc(
            Long patientId, LocalDate date, List<AppointmentStatus> statuses);
}
