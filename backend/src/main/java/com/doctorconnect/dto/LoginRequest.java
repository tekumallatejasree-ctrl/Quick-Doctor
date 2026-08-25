package com.doctorconnect.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

/**
 * Login request (for both Patient and Doctor).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginRequest {

    @NotBlank(message = "Username is required")
    private String username;

    @NotBlank(message = "Password is required")
    private String password;

    private boolean rememberMe;
}
