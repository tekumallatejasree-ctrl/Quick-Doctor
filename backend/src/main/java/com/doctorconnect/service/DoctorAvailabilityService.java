package com.doctorconnect.service;

import com.doctorconnect.dto.DoctorAvailabilityDto;
import com.doctorconnect.dto.SetAvailabilityRequest;
import com.doctorconnect.dto.TimeSlotDto;
import com.doctorconnect.entity.Appointment;
import com.doctorconnect.entity.AppointmentStatus;
import com.doctorconnect.entity.Doctor;
import com.doctorconnect.entity.DoctorAvailability;
import com.doctorconnect.exception.ResourceNotFoundException;
import com.doctorconnect.repository.AppointmentRepository;
import com.doctorconnect.repository.DoctorAvailabilityRepository;
import com.doctorconnect.repository.DoctorRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DoctorAvailabilityService {

    private static final Logger logger = LoggerFactory.getLogger(DoctorAvailabilityService.class);

    private final DoctorAvailabilityRepository availabilityRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;

    public DoctorAvailabilityService(DoctorAvailabilityRepository availabilityRepository,
                                   DoctorRepository doctorRepository,
                                   AppointmentRepository appointmentRepository) {
        this.availabilityRepository = availabilityRepository;
        this.doctorRepository = doctorRepository;
        this.appointmentRepository = appointmentRepository;
    }

    /**
     * Get the single primary clinic doctor.
     */
    public Doctor getPrimaryDoctor() {
        return doctorRepository.findAll().stream()
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("No doctor registered in the system"));
    }

    /**
     * Get availability schedule for the primary doctor.
     */
    public List<DoctorAvailabilityDto> getAvailability() {
        Doctor doctor = getPrimaryDoctor();
        return getAvailabilityForDoctor(doctor.getId());
    }

    /**
     * Get availability for a specific doctor by ID.
     */
    public List<DoctorAvailabilityDto> getAvailabilityForDoctor(Long doctorId) {
        List<DoctorAvailability> availabilities = availabilityRepository.findByDoctorId(doctorId);
        return availabilities.stream()
                .sorted(Comparator.comparing(a -> a.getDayOfWeek().getValue()))
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /**
     * Set or update availability for the doctor.
     */
    @Transactional
    public List<DoctorAvailabilityDto> setAvailability(String doctorUsername, SetAvailabilityRequest request) {
        Doctor doctor = doctorRepository.findByUserUsername(doctorUsername)
                .orElseGet(this::getPrimaryDoctor);

        for (SetAvailabilityRequest.DayScheduleItem item : request.getSchedules()) {
            if (item.getDayOfWeek() == null) continue;

            Optional<DoctorAvailability> existingOpt = availabilityRepository
                    .findByDoctorIdAndDayOfWeek(doctor.getId(), item.getDayOfWeek());

            DoctorAvailability availability;
            if (existingOpt.isPresent()) {
                availability = existingOpt.get();
                availability.setStartTime(item.getStartTime() != null ? item.getStartTime() : LocalTime.of(9, 0));
                availability.setEndTime(item.getEndTime() != null ? item.getEndTime() : LocalTime.of(17, 0));
                availability.setSlotDurationMinutes(item.getSlotDurationMinutes() != null ? item.getSlotDurationMinutes() : 30);
                availability.setIsActive(item.getIsActive() != null ? item.getIsActive() : true);
            } else {
                availability = DoctorAvailability.builder()
                        .doctor(doctor)
                        .dayOfWeek(item.getDayOfWeek())
                        .startTime(item.getStartTime() != null ? item.getStartTime() : LocalTime.of(9, 0))
                        .endTime(item.getEndTime() != null ? item.getEndTime() : LocalTime.of(17, 0))
                        .slotDurationMinutes(item.getSlotDurationMinutes() != null ? item.getSlotDurationMinutes() : 30)
                        .isActive(item.getIsActive() != null ? item.getIsActive() : true)
                        .build();
            }
            availabilityRepository.save(availability);
        }

        return getAvailabilityForDoctor(doctor.getId());
    }

    /**
     * Compute available time slots for a specific date.
     */
    public List<TimeSlotDto> getAvailableSlots(LocalDate date) {
        Doctor doctor = getPrimaryDoctor();
        DayOfWeek dayOfWeek = date.getDayOfWeek();

        Optional<DoctorAvailability> availabilityOpt = availabilityRepository
                .findByDoctorIdAndDayOfWeek(doctor.getId(), dayOfWeek);

        if (availabilityOpt.isEmpty() || Boolean.FALSE.equals(availabilityOpt.get().getIsActive())) {
            return Collections.emptyList();
        }

        DoctorAvailability availability = availabilityOpt.get();
        LocalTime start = availability.getStartTime();
        LocalTime end = availability.getEndTime();
        int slotMinutes = availability.getSlotDurationMinutes() != null && availability.getSlotDurationMinutes() > 0
                ? availability.getSlotDurationMinutes()
                : 30;

        // Fetch already booked / active appointments for the date
        List<Appointment> bookedAppointments = appointmentRepository.findByDoctorIdAndAppointmentDateAndStatusIn(
                doctor.getId(), date, List.of(AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED));

        Set<LocalTime> bookedStartTimes = bookedAppointments.stream()
                .map(Appointment::getStartTime)
                .collect(Collectors.toSet());

        List<TimeSlotDto> slots = new ArrayList<>();
        LocalTime current = start;
        LocalTime now = LocalTime.now();
        boolean isToday = date.equals(LocalDate.now());

        while (current.plusMinutes(slotMinutes).isBefore(end) || current.plusMinutes(slotMinutes).equals(end)) {
            LocalTime slotEnd = current.plusMinutes(slotMinutes);
            
            boolean isBooked = bookedStartTimes.contains(current);
            boolean isPastTime = isToday && current.isBefore(now);
            boolean available = !isBooked && !isPastTime;

            slots.add(TimeSlotDto.builder()
                    .startTime(current)
                    .endTime(slotEnd)
                    .isAvailable(available)
                    .build());

            current = slotEnd;
        }

        return slots;
    }

    private DoctorAvailabilityDto mapToDto(DoctorAvailability a) {
        return DoctorAvailabilityDto.builder()
                .id(a.getId())
                .dayOfWeek(a.getDayOfWeek())
                .startTime(a.getStartTime())
                .endTime(a.getEndTime())
                .slotDurationMinutes(a.getSlotDurationMinutes())
                .isActive(a.getIsActive())
                .build();
    }
}
