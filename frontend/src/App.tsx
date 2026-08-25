import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from '@/layouts/ProtectedRoute';

// Public pages
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import VerifyOtpPage from '@/pages/VerifyOtpPage';

// Patient pages
import PatientDashboard from '@/pages/patient/PatientDashboard';
import PatientProfile from '@/pages/patient/PatientProfile';
import BookAppointment from '@/pages/patient/BookAppointment';
import MyAppointments from '@/pages/patient/MyAppointments';
import MyPrescriptions from '@/pages/patient/MyPrescriptions';

// Doctor pages
import DoctorDashboard from '@/pages/doctor/DoctorDashboard';
import DoctorProfile from '@/pages/doctor/DoctorProfile';
import ScheduleManager from '@/pages/doctor/ScheduleManager';
import AppointmentRequests from '@/pages/doctor/AppointmentRequests';
import ConsultationRoom from '@/pages/doctor/ConsultationRoom';

// Shared pages
import NotificationsPage from '@/pages/NotificationsPage';

import './index.css';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-otp" element={<VerifyOtpPage />} />

          {/* Patient Protected Routes */}
          <Route element={<ProtectedRoute allowedRole="PATIENT" />}>
            <Route path="/patient/dashboard" element={<PatientDashboard />} />
            <Route path="/patient/book" element={<BookAppointment />} />
            <Route path="/patient/appointments" element={<MyAppointments />} />
            <Route path="/patient/prescriptions" element={<MyPrescriptions />} />
            <Route path="/patient/profile" element={<PatientProfile />} />
            <Route path="/patient/notifications" element={<NotificationsPage />} />
            <Route path="/patient/doctors" element={<Navigate to="/patient/book" replace />} />
          </Route>

          {/* Doctor Protected Routes */}
          <Route element={<ProtectedRoute allowedRole="DOCTOR" />}>
            <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
            <Route path="/doctor/appointments" element={<AppointmentRequests />} />
            <Route path="/doctor/consultation/:appointmentId" element={<ConsultationRoom />} />
            <Route path="/doctor/schedule" element={<ScheduleManager />} />
            <Route path="/doctor/profile" element={<DoctorProfile />} />
            <Route path="/doctor/notifications" element={<NotificationsPage />} />
          </Route>

          {/* Catch all — redirect to landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
