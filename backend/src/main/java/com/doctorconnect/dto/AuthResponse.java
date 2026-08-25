package com.doctorconnect.dto;

import lombok.*;

/**
 * Authentication response containing JWT token and user info.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {

    private String token;
    private String type;
    private String username;
    private String role;
    private String message;

    public AuthResponse(String token, String username, String role) {
        this.token = token;
        this.type = "Bearer";
        this.username = username;
        this.role = role;
        this.message = "Login successful";
    }
}
