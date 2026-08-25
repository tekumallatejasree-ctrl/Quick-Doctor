import api from '@/lib/axios';
import type {
  ApiResponse,
  Consultation,
  CompleteConsultationRequest,
} from '@/types';

export const consultationService = {
  startConsultation: (appointmentId: number) =>
    api.post<ApiResponse<Consultation>>(`/consultations/start/${appointmentId}`),

  completeConsultation: (appointmentId: number, data: CompleteConsultationRequest) =>
    api.post<ApiResponse<Consultation>>(`/consultations/complete/${appointmentId}`, data),

  getConsultationByAppointment: (appointmentId: number) =>
    api.get<ApiResponse<Consultation>>(`/consultations/appointment/${appointmentId}`),

  getPatientHistory: () =>
    api.get<ApiResponse<Consultation[]>>('/consultations/patient/history'),
};
