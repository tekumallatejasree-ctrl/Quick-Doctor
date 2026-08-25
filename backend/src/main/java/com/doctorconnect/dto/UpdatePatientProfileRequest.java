package com.doctorconnect.dto;

import lombok.*;

/**
 * Request to update patient profile.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdatePatientProfileRequest {

    private String fullName;
    private String mobile;
    private String address;
    private String emergencyContact;
}
