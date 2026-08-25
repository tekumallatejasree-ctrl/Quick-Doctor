import api from '@/lib/axios';
import type {
  ApiResponse,
  DoctorProfile,
  DoctorDashboard,
  UpdateDoctorProfile,
  DoctorAvailability,
  SetAvailabilityRequest,
  TimeSlot,
} from '@/types';

export const doctorService = {
  getPublicProfile: () =>
    api.get<ApiResponse<DoctorProfile>>('/doctor/public-profile'),

  getProfile: () =>
    api.get<ApiResponse<DoctorProfile>>('/doctor/profile'),

  updateProfile: (data: UpdateDoctorProfile) =>
    api.put<ApiResponse<DoctorProfile>>('/doctor/profile', data),

  getDashboard: () =>
    api.get<ApiResponse<DoctorDashboard>>('/doctor/dashboard'),

  getAvailability: () =>
    api.get<ApiResponse<DoctorAvailability[]>>('/doctor/availability'),

  setAvailability: (data: SetAvailabilityRequest) =>
    api.put<ApiResponse<DoctorAvailability[]>>('/doctor/availability', data),

  getAvailableSlots: (date: string) =>
    api.get<ApiResponse<TimeSlot[]>>('/doctor/available-slots', { params: { date } }),
};
