package com.doctorconnect.dto;

import lombok.*;

import java.math.BigDecimal;

/**
 * Doctor profile response DTO (public card view).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorProfileDto {

    private Long id;
    private String name;
    private String username;
    private String email;
    private String qualification;
    private String specialization;
    private Integer experience;
    private BigDecimal consultationFee;
    private String mobile;
    private String photo;
    private String languagesKnown;
    private String upiId;
    private String bio;
}
