package com.doctorconnect.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * Enable async processing for email sending.
 */
@Configuration
@EnableAsync
public class AsyncConfig {
}
