package com.doctorconnect.config;

import com.doctorconnect.entity.Doctor;
import com.doctorconnect.entity.DoctorAvailability;
import com.doctorconnect.entity.Role;
import com.doctorconnect.entity.User;
import com.doctorconnect.repository.DoctorAvailabilityRepository;
import com.doctorconnect.repository.DoctorRepository;
import com.doctorconnect.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalTime;

/**
 * Seeds sample clinic doctor account and weekly availability schedule on startup.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final DoctorAvailabilityRepository availabilityRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           DoctorRepository doctorRepository,
                           DoctorAvailabilityRepository availabilityRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.doctorRepository = doctorRepository;
        this.availabilityRepository = availabilityRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        String defaultPassword = "Doctor@123";

        Doctor primaryDoctor = createDoctorIfNotExists("dr.sharma", "dr.sharma@doctorconnect.com", defaultPassword,
                "Dr. Arun Sharma", "MBBS, MD (General Medicine)", "General Medicine",
                15, new BigDecimal("500.00"), "9876543210",
                "English, Hindi, Tamil",
                "Experienced general medicine practitioner with 15 years of clinical experience. Specializes in preventive healthcare and chronic disease management.");

        if (primaryDoctor == null) {
            primaryDoctor = doctorRepository.findByUserUsername("dr.sharma").orElse(null);
        }

        if (primaryDoctor != null) {
            seedDoctorAvailability(primaryDoctor);
        }
    }

    private Doctor createDoctorIfNotExists(String username, String email, String password,
                                          String name, String qualification, String specialization,
                                          int experience, BigDecimal fee, String mobile,
                                          String languages, String bio) {
        if (userRepository.existsByUsername(username)) {
            logger.info("Doctor '{}' already exists, skipping user creation.", username);
            return null;
        }

        // Create User account
        User user = User.builder()
                .username(username)
                .email(email)
                .password(passwordEncoder.encode(password))
                .role(Role.DOCTOR)
                .isVerified(true)
                .isActive(true)
                .build();
        user = userRepository.save(user);

        // Create Doctor profile
        Doctor doctor = Doctor.builder()
                .user(user)
                .name(name)
                .qualification(qualification)
                .specialization(specialization)
                .experience(experience)
                .consultationFee(fee)
                .mobile(mobile)
                .email(email)
                .languagesKnown(languages)
                .bio(bio)
                .build();
        doctor = doctorRepository.save(doctor);

        logger.info("Created primary clinic doctor: {} ({})", name, username);
        return doctor;
    }

    private void seedDoctorAvailability(Doctor doctor) {
        if (availabilityRepository.existsByDoctorId(doctor.getId())) {
            return;
        }

        DayOfWeek[] workDays = {
                DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY,
                DayOfWeek.THURSDAY, DayOfWeek.FRIDAY, DayOfWeek.SATURDAY
        };

        for (DayOfWeek day : workDays) {
            DoctorAvailability availability = DoctorAvailability.builder()
                    .doctor(doctor)
                    .dayOfWeek(day)
                    .startTime(LocalTime.of(9, 0))
                    .endTime(LocalTime.of(17, 0))
                    .slotDurationMinutes(30)
                    .isActive(true)
                    .build();
            availabilityRepository.save(availability);
        }

        logger.info("Seeded default weekly availability schedule for Dr. {}", doctor.getName());
    }
}
