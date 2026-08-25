package com.doctorconnect.dto;

import lombok.*;

import java.math.BigDecimal;

/**
 * Request to update doctor profile.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateDoctorProfileRequest {

    private String name;
    private String qualification;
    private String specialization;
    private Integer experience;
    private BigDecimal consultationFee;
    private String languagesKnown;
    private String upiId;
    private String bio;
    private String mobile;
}
