import api from '@/lib/axios';
import type { ApiResponse, PatientProfile, PatientDashboard, DoctorProfile, UpdatePatientProfile } from '@/types';

export const patientService = {
  getProfile: () =>
    api.get<ApiResponse<PatientProfile>>('/patient/profile'),

  updateProfile: (data: UpdatePatientProfile) =>
    api.put<ApiResponse<PatientProfile>>('/patient/profile', data),

  getDashboard: () =>
    api.get<ApiResponse<PatientDashboard>>('/patient/dashboard'),

  getDoctors: () =>
    api.get<ApiResponse<DoctorProfile[]>>('/patient/doctors'),
};
