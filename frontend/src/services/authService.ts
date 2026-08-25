import api from '@/lib/axios';
import type { AuthResponse, LoginRequest, RegisterRequest, OtpVerifyRequest, ResendOtpRequest, ApiResponse } from '@/types';

export const authService = {
  register: (data: RegisterRequest) =>
    api.post<ApiResponse<null>>('/auth/register', data),

  login: (data: LoginRequest) =>
    api.post<AuthResponse>('/auth/login', data),

  verifyOtp: (data: OtpVerifyRequest) =>
    api.post<ApiResponse<null>>('/auth/verify-otp', data),

  resendOtp: (data: ResendOtpRequest) =>
    api.post<ApiResponse<null>>('/auth/resend-otp', data),

  logout: () =>
    api.post<ApiResponse<null>>('/auth/logout'),
};
