import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { patientService } from '@/services/patientService';
import { doctorService } from '@/services/doctorService';
import { appointmentService } from '@/services/appointmentService';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import DashboardCard from '@/components/DashboardCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import type { PatientDashboard, DoctorProfile, Appointment } from '@/types';
import {
  CalendarDays, History, Bell, FileText,
  ArrowRight, Stethoscope, Clock, Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PatientDashboardPage() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<PatientDashboard | null>(null);
  const [doctor, setDoctor] = useState<DoctorProfile | null>(null);
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [dashRes, docRes, aptRes] = await Promise.all([
        patientService.getDashboard(),
        doctorService.getPublicProfile().catch(() => ({ data: { data: null } })),
        appointmentService.getMyAppointments().catch(() => ({ data: { data: [] } })),
      ]);
      setDashboard(dashRes.data.data);
      setDoctor(docRes.data.data);
      setRecentAppointments((aptRes.data.data || []).slice(0, 3));
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${m.toString().padStart(2, '0')} ${period}`;
  };

  if (isLoading) return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1"><Sidebar /><div className="flex-1"><LoadingSpinner size="lg" /></div></div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-background)]">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto max-w-7xl">
          {/* Welcome Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-[var(--color-text)]">
                Welcome back, <span className="text-gradient">{user?.username}</span> 👋
              </h1>
              <p className="text-[var(--color-text-muted)] mt-1">
                Here's an overview of your consultations and health dashboard
              </p>
            </div>
            <Link
              to="/patient/book"
              className="inline-flex items-center gap-2 px-6 py-3 gradient-primary text-white rounded-xl text-sm font-semibold shadow-md hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" /> Book Consultation
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <DashboardCard
              title="Upcoming"
              value={dashboard?.upcomingAppointments ?? 0}
              icon={CalendarDays}
              color="#2563EB"
              bgColor="#eff6ff"
              description="Consultations"
            />
            <DashboardCard
              title="Past"
              value={dashboard?.pastAppointments ?? 0}
              icon={History}
              color="#8b5cf6"
              bgColor="#f5f3ff"
              description="Consultations"
            />
            <DashboardCard
              title="Notifications"
              value={dashboard?.unreadNotifications ?? 0}
              icon={Bell}
              color="#f59e0b"
              bgColor="#fffbeb"
              description="Unread"
            />
            <DashboardCard
              title="Prescriptions"
              value={dashboard?.prescriptions ?? 0}
              icon={FileText}
              color="#06b6d4"
              bgColor="#ecfeff"
              description="Available"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Primary Doctor Spotlight */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 border border-[var(--color-border)] shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-base text-[var(--color-text)]">Clinic Doctor</h3>
                  <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200">
                    Available
                  </span>
                </div>

                {doctor ? (
                  <div>
                    <div className="flex items-center gap-3.5 mb-4">
                      <div className="w-12 h-12 rounded-xl gradient-primary text-white flex items-center justify-center flex-shrink-0">
                        <Stethoscope className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-[var(--color-text)]">{doctor.name}</h4>
                        <p className="text-xs text-[var(--color-primary)] font-medium">
                          {doctor.specialization || 'General Medicine'}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-[var(--color-text-secondary)] border-t border-[var(--color-border)] pt-3 mb-6">
                      <div className="flex justify-between">
                        <span className="text-[var(--color-text-muted)]">Experience:</span>
                        <span className="font-semibold text-[var(--color-text)]">{doctor.experience} Years</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--color-text-muted)]">Fee:</span>
                        <span className="font-bold text-emerald-600">₹{doctor.consultationFee}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--color-text-muted)]">Languages:</span>
                        <span className="font-semibold text-[var(--color-text)]">{doctor.languagesKnown || 'English'}</span>
                      </div>
                    </div>

                    <Link
                      to="/patient/book"
                      className="w-full py-2.5 gradient-primary text-white rounded-xl text-xs font-semibold shadow-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
                    >
                      Book Slot with Dr. {doctor.name.split(' ')[1] || doctor.name}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ) : (
                  <p className="text-xs text-[var(--color-text-muted)]">Doctor profile loading...</p>
                )}
              </div>
            </div>

            {/* Recent Appointments */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl p-6 border border-[var(--color-border)] shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-bold text-lg text-[var(--color-text)]">Recent Appointments</h3>
                    <p className="text-xs text-[var(--color-text-muted)]">Your recent and upcoming consultations</p>
                  </div>
                  <Link
                    to="/patient/appointments"
                    className="text-xs font-semibold text-[var(--color-primary)] hover:underline flex items-center gap-1"
                  >
                    View All <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {recentAppointments.length === 0 ? (
                  <div className="py-10 text-center border border-dashed border-[var(--color-border)] rounded-xl">
                    <CalendarDays className="w-10 h-10 text-[var(--color-text-muted)] mx-auto mb-2" />
                    <p className="text-sm font-semibold text-[var(--color-text)]">No appointments yet</p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5 mb-4">Book your first doctor consultation in just a few clicks</p>
                    <Link
                      to="/patient/book"
                      className="inline-flex items-center gap-1.5 px-4 py-2 gradient-primary text-white rounded-xl text-xs font-semibold shadow-sm hover:opacity-90 transition-opacity"
                    >
                      <Plus className="w-3.5 h-3.5" /> Book Now
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentAppointments.map((apt) => (
                      <div
                        key={apt.id}
                        className="p-4 rounded-xl border border-[var(--color-border)] hover:bg-slate-50/50 transition-colors flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                            <CalendarDays className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-[var(--color-text)]">{apt.appointmentDate}</p>
                            <p className="text-xs text-[var(--color-text-muted)] flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3" /> {formatTime(apt.startTime)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold
                            ${apt.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : apt.status === 'CONFIRMED' ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : apt.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'}`}
                          >
                            {apt.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
