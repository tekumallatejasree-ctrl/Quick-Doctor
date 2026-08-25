import api from '@/lib/axios';
import type { ApiResponse, Prescription } from '@/types';

export const prescriptionService = {
  getById: (id: number) =>
    api.get<ApiResponse<Prescription>>(`/prescriptions/${id}`),

  getByConsultationId: (consultationId: number) =>
    api.get<ApiResponse<Prescription>>(`/prescriptions/consultation/${consultationId}`),

  getMyPrescriptions: () =>
    api.get<ApiResponse<Prescription[]>>('/prescriptions/patient/my-prescriptions'),
};
