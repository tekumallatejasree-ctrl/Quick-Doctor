import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { doctorService } from '@/services/doctorService';
import { appointmentService } from '@/services/appointmentService';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import DashboardCard from '@/components/DashboardCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import type { DoctorDashboard, Appointment } from '@/types';
import {
  CalendarDays, Clock, CalendarCheck, CheckCircle2,
  Bell, ArrowRight, Calendar, Check, X
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DoctorDashboardPage() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<DoctorDashboard | null>(null);
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [pendingAppointments, setPendingAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const [dashRes, aptRes] = await Promise.all([
        doctorService.getDashboard(),
        appointmentService.getDoctorAppointments().catch(() => ({ data: { data: [] } })),
      ]);
      setDashboard(dashRes.data.data);

      const allApts: Appointment[] = aptRes.data.data || [];
      setTodayAppointments(allApts.filter((a) => a.appointmentDate === todayStr));
      setPendingAppointments(allApts.filter((a) => a.status === 'PENDING').slice(0, 4));
    } catch {
      console.error('Failed to load dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickStatus = async (id: number, status: 'CONFIRMED' | 'REJECTED') => {
    try {
      await appointmentService.updateStatus(id, { status });
      loadData();
    } catch (err) {
      console.error('Failed to update status', err);
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
    <div className="min-h-screen flex flex-col"><Navbar /><div className="flex flex-1"><Sidebar /><div className="flex-1"><LoadingSpinner size="lg" /></div></div></div>
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
                Welcome, <span className="text-gradient">Dr. {user?.username}</span> 🩺
              </h1>
              <p className="text-[var(--color-text-muted)] mt-1">
                Here is your clinic overview and appointment queue for today
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                to="/doctor/schedule"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white border border-[var(--color-border)] rounded-xl text-xs font-semibold text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] transition-colors shadow-sm"
              >
                <Calendar className="w-4 h-4 text-[var(--color-primary)]" />
                Manage Schedule
              </Link>
              <Link
                to="/doctor/appointments"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 gradient-primary text-white rounded-xl text-xs font-semibold shadow-md hover:opacity-90 transition-opacity"
              >
                Appointment Portal
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <DashboardCard
              title="Today's Queue"
              value={dashboard?.todayAppointments ?? 0}
              icon={CalendarDays}
              color="#2563EB"
              bgColor="#eff6ff"
              description="Appointments"
            />
            <DashboardCard
              title="Pending Approval"
              value={dashboard?.pendingVerification ?? 0}
              icon={Clock}
              color="#f59e0b"
              bgColor="#fffbeb"
              description="Requests"
            />
            <DashboardCard
              title="Confirmed"
              value={dashboard?.upcomingAppointments ?? 0}
              icon={CalendarCheck}
              color="#8b5cf6"
              bgColor="#f5f3ff"
              description="Upcoming"
            />
            <DashboardCard
              title="Completed"
              value={dashboard?.completedConsultations ?? 0}
              icon={CheckCircle2}
              color="#10b981"
              bgColor="#ecfdf5"
              description="Consultations"
            />
            <DashboardCard
              title="Notifications"
              value={dashboard?.unreadNotifications ?? 0}
              icon={Bell}
              color="#06b6d4"
              bgColor="#ecfeff"
              description="Unread"
            />
          </div>

          {/* Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Today's Patients Queue */}
            <div className="bg-white rounded-2xl p-6 border border-[var(--color-border)] shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-[var(--color-text)]">Today's Appointments</h2>
                  <p className="text-xs text-[var(--color-text-muted)]">Scheduled consultations for today</p>
                </div>
                <Link
                  to="/doctor/appointments"
                  className="text-xs font-semibold text-[var(--color-primary)] hover:underline flex items-center gap-1"
                >
                  View All <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {todayAppointments.length === 0 ? (
                <div className="py-10 text-center border border-dashed border-[var(--color-border)] rounded-xl">
                  <CalendarDays className="w-10 h-10 text-[var(--color-text-muted)] mx-auto mb-2" />
                  <p className="text-sm font-semibold text-[var(--color-text)]">No appointments for today</p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Your schedule is open today</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayAppointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="p-3.5 rounded-xl border border-[var(--color-border)] hover:bg-slate-50/50 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                          {apt.startTime.substring(0, 5)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[var(--color-text)]">{apt.patientName}</p>
                          <p className="text-xs text-[var(--color-text-muted)]">{apt.reasonForVisit || 'General Consultation'}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold
                          ${apt.status === 'CONFIRMED' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'}`}
                        >
                          {apt.status}
                        </span>
                        {apt.status === 'CONFIRMED' && (
                          <Link
                            to={`/doctor/consultation/${apt.id}`}
                            className="px-2.5 py-1 text-xs font-bold text-white gradient-primary hover:opacity-90 rounded-lg shadow-xs transition-opacity"
                          >
                            Consult (Rx)
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pending Requests Requiring Approval */}
            <div className="bg-white rounded-2xl p-6 border border-[var(--color-border)] shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-[var(--color-text)]">Pending Requests</h2>
                  <p className="text-xs text-[var(--color-text-muted)]">Patients waiting for confirmation</p>
                </div>
                <Link
                  to="/doctor/appointments"
                  className="text-xs font-semibold text-[var(--color-primary)] hover:underline flex items-center gap-1"
                >
                  View All <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {pendingAppointments.length === 0 ? (
                <div className="py-10 text-center border border-dashed border-[var(--color-border)] rounded-xl">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-[var(--color-text)]">All caught up!</p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">No pending appointment requests</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingAppointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="p-3.5 rounded-xl border border-[var(--color-border)] flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[var(--color-text)]">{apt.patientName}</span>
                          <span className="text-xs text-[var(--color-text-muted)]">({apt.appointmentDate} at {formatTime(apt.startTime)})</span>
                        </div>
                        {apt.reasonForVisit && (
                          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 line-clamp-1">
                            {apt.reasonForVisit}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => handleQuickStatus(apt.id, 'REJECTED')}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                          title="Decline"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleQuickStatus(apt.id, 'CONFIRMED')}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                          title="Accept"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
