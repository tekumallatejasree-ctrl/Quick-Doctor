package com.doctorconnect.dto;

import lombok.*;

/**
 * Patient profile response DTO.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientProfileDto {

    private Long id;
    private String fullName;
    private String username;
    private String email;
    private String mobile;
    private String address;
    private String profilePicture;
    private String emergencyContact;
}
