// =============================================
// DoctorConnect TypeScript Types
// =============================================

// --- Auth Types ---
export interface LoginRequest {
  username: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterRequest {
  fullName: string;
  username: string;
  email: string;
  mobile: string;
  password: string;
  confirmPassword: string;
}

export interface OtpVerifyRequest {
  email: string;
  otp: string;
}

export interface ResendOtpRequest {
  email: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  username: string;
  role: string;
  message: string;
}

// --- User Types ---
export interface User {
  username: string;
  role: string;
  token: string;
}

// --- Patient Types ---
export interface PatientProfile {
  id: number;
  fullName: string;
  username: string;
  email: string;
  mobile: string;
  address: string | null;
  profilePicture: string | null;
  emergencyContact: string | null;
}

export interface UpdatePatientProfile {
  fullName?: string;
  mobile?: string;
  address?: string;
  emergencyContact?: string;
}

export interface PatientDashboard {
  upcomingAppointments: number;
  pastAppointments: number;
  totalDoctors: number;
  unreadNotifications: number;
  prescriptions: number;
}

// --- Doctor Types ---
export interface DoctorProfile {
  id: number;
  name: string;
  username: string;
  email: string;
  qualification: string;
  specialization: string;
  experience: number;
  consultationFee: number;
  mobile: string;
  photo: string | null;
  languagesKnown: string;
  upiId: string | null;
  bio: string | null;
}

export interface UpdateDoctorProfile {
  name?: string;
  qualification?: string;
  specialization?: string;
  experience?: number;
  consultationFee?: number;
  languagesKnown?: string;
  upiId?: string;
  bio?: string;
  mobile?: string;
}

export interface DoctorDashboard {
  todayAppointments: number;
  pendingVerification: number;
  upcomingAppointments: number;
  completedConsultations: number;
  cancelledAppointments: number;
  unreadNotifications: number;
}

// --- Appointment & Availability Types ---
export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';

export interface Appointment {
  id: number;
  appointmentNumber: string;
  patientId: number;
  patientName: string;
  patientMobile: string | null;
  patientEmail: string | null;
  doctorId: number;
  doctorName: string;
  doctorSpecialization: string | null;
  consultationFee: number | null;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  reasonForVisit: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DoctorAvailability {
  id: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  isActive: boolean;
}

export interface DayScheduleItem {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  isActive: boolean;
}

export interface SetAvailabilityRequest {
  schedules: DayScheduleItem[];
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface BookAppointmentRequest {
  appointmentDate: string;
  startTime: string;
  reasonForVisit?: string;
}

export interface UpdateAppointmentStatusRequest {
  status: AppointmentStatus;
  rejectionReason?: string;
}

// --- Consultation & Prescription Types (Phase 2) ---
export interface PrescriptionMedicine {
  id?: number;
  medicineName: string;
  dosage: string;
  frequency: string;
  durationDays: number;
  instructions?: string;
}

export interface Prescription {
  id: number;
  prescriptionNumber: string;
  consultationId?: number;
  appointmentId?: number;
  appointmentNumber?: string;
  doctorId: number;
  doctorName: string;
  doctorSpecialization: string | null;
  doctorQualification: string | null;
  patientId: number;
  patientName: string;
  patientMobile: string | null;
  patientEmail: string | null;
  adviceNotes?: string;
  followUpDate?: string;
  medicines: PrescriptionMedicine[];
  createdAt: string;
}

export interface CompleteConsultationRequest {
  symptoms?: string;
  diagnosis: string;
  clinicalNotes?: string;
  followUpDate?: string;
  adviceNotes?: string;
  medicines?: PrescriptionMedicine[];
}

export interface Consultation {
  id: number;
  appointmentId: number;
  appointmentNumber: string;
  doctorId: number;
  doctorName: string;
  doctorSpecialization: string | null;
  patientId: number;
  patientName: string;
  patientMobile: string | null;
  symptoms: string | null;
  diagnosis: string | null;
  clinicalNotes: string | null;
  followUpDate: string | null;
  status: string;
  prescription?: Prescription;
  createdAt: string;
  updatedAt: string;
}

// --- Notification Types ---
export interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

// --- API Response ---
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
