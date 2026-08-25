import api from '@/lib/axios';
import type {
  ApiResponse,
  Appointment,
  BookAppointmentRequest,
  UpdateAppointmentStatusRequest,
} from '@/types';

export const appointmentService = {
  bookAppointment: (data: BookAppointmentRequest) =>
    api.post<ApiResponse<Appointment>>('/appointments/book', data),

  getMyAppointments: () =>
    api.get<ApiResponse<Appointment[]>>('/appointments/my-appointments'),

  getDoctorAppointments: () =>
    api.get<ApiResponse<Appointment[]>>('/appointments/doctor/all'),

  updateStatus: (id: number, data: UpdateAppointmentStatusRequest) =>
    api.patch<ApiResponse<Appointment>>(`/appointments/${id}/status`, data),

  cancelAppointment: (id: number, reason?: string) =>
    api.patch<ApiResponse<Appointment>>(`/appointments/${id}/cancel`, { reason }),
};
