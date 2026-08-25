package com.doctorconnect.util;

import java.security.SecureRandom;

/**
 * Utility class for generating OTPs.
 */
public final class OtpGenerator {

    private static final SecureRandom RANDOM = new SecureRandom();

    private OtpGenerator() {
        // Prevent instantiation
    }

    /**
     * Generate a 6-digit numeric OTP.
     */
    public static String generateOtp() {
        int otp = 100000 + RANDOM.nextInt(900000);
        return String.valueOf(otp);
    }
}
