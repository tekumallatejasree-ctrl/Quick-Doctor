import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import LoadingSpinner from '@/components/LoadingSpinner';
import { appointmentService } from '@/services/appointmentService';
import type { Appointment, AppointmentStatus } from '@/types';
import {
  CalendarDays, Clock, Plus, AlertCircle, X, CheckCircle2,
  Calendar, Stethoscope, Pill
} from 'lucide-react';

export default function MyAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | AppointmentStatus>('ALL');
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isProcessingCancel, setIsProcessingCancel] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    setIsLoading(true);
    try {
      const res = await appointmentService.getMyAppointments();
      setAppointments(res.data.data || []);
    } catch (err) {
      console.error('Failed to load appointments', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelAppointment = async (id: number) => {
    setIsProcessingCancel(true);
    setMessage(null);
    try {
      await appointmentService.cancelAppointment(id, cancelReason.trim() || undefined);
      setMessage({ text: 'Appointment cancelled successfully.', type: 'success' });
      setCancellingId(null);
      setCancelReason('');
      loadAppointments();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to cancel appointment.';
      setMessage({ text: msg, type: 'error' });
    } finally {
      setIsProcessingCancel(false);
    }
  };

  const filteredAppointments = activeTab === 'ALL'
    ? appointments
    : appointments.filter((a) => a.status === activeTab);

  const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${m.toString().padStart(2, '0')} ${period}`;
  };

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-semibold">Pending Confirmation</span>;
      case 'CONFIRMED':
        return <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-semibold">Confirmed</span>;
      case 'COMPLETED':
        return <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold">Completed</span>;
      case 'CANCELLED':
        return <span className="px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-full text-xs font-semibold">Cancelled</span>;
      case 'REJECTED':
        return <span className="px-3 py-1 bg-slate-100 text-slate-700 border border-slate-300 rounded-full text-xs font-semibold">Declined</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-background)]">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto max-w-6xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-[var(--color-text)]">
                My Appointments
              </h1>
              <p className="text-[var(--color-text-muted)] mt-1">
                Manage and track all your doctor consultations
              </p>
            </div>
            <Link
              to="/patient/book"
              className="inline-flex items-center gap-2 px-5 py-2.5 gradient-primary text-white rounded-xl text-sm font-medium shadow-md hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" /> Book Consultation
            </Link>
          </div>

          {/* Flash message */}
          {message && (
            <div className={`p-4 rounded-xl mb-6 text-sm flex items-center justify-between
              ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
              <div className="flex items-center gap-2">
                {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                <span>{message.text}</span>
              </div>
              <button onClick={() => setMessage(null)} className="p-1 hover:opacity-70">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Status Tabs */}
          <div className="flex overflow-x-auto gap-2 pb-2 mb-6 border-b border-[var(--color-border)]">
            {(['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200
                  ${activeTab === tab
                    ? 'bg-[var(--color-primary)] text-white shadow-sm'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]'
                  }`}
              >
                {tab === 'ALL' ? 'All Bookings' : tab.charAt(0) + tab.slice(1).toLowerCase()}
                {tab === 'ALL' ? ` (${appointments.length})` : ` (${appointments.filter(a => a.status === tab).length})`}
              </button>
            ))}
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="py-16">
              <LoadingSpinner size="lg" />
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-[var(--color-border)]">
              <Calendar className="w-14 h-14 text-[var(--color-text-muted)] mx-auto mb-4" />
              <h3 className="text-lg font-bold text-[var(--color-text)]">No appointments found</h3>
              <p className="text-sm text-[var(--color-text-muted)] mt-1 mb-6">
                You do not have any {activeTab !== 'ALL' ? activeTab.toLowerCase() : ''} consultations scheduled.
              </p>
              <Link
                to="/patient/book"
                className="inline-flex items-center gap-2 px-5 py-2.5 gradient-primary text-white rounded-xl text-sm font-medium shadow-md hover:opacity-90 transition-opacity"
              >
                <Plus className="w-4 h-4" /> Book Appointment Now
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="bg-white rounded-2xl p-6 border border-[var(--color-border)] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    {/* Header: ID & Status */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-semibold text-[var(--color-text-muted)] tracking-wider">
                        {apt.appointmentNumber}
                      </span>
                      {getStatusBadge(apt.status)}
                    </div>

                    {/* Doctor Info */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl gradient-primary text-white flex items-center justify-center flex-shrink-0">
                        <Stethoscope className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-[var(--color-text)]">{apt.doctorName}</h4>
                        <p className="text-xs text-[var(--color-primary)] font-medium">
                          {apt.doctorSpecialization || 'General Consultation'}
                        </p>
                      </div>
                    </div>

                    {/* Date & Time */}
                    <div className="bg-slate-50 rounded-xl p-3.5 border border-[var(--color-border)] mb-4 space-y-1.5 text-xs text-[var(--color-text-secondary)]">
                      <div className="flex items-center gap-2 text-[var(--color-text)] font-semibold">
                        <CalendarDays className="w-4 h-4 text-[var(--color-primary)]" />
                        <span>{apt.appointmentDate}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[var(--color-text)]">
                        <Clock className="w-4 h-4 text-[var(--color-primary)]" />
                        <span>{formatTime(apt.startTime)} - {formatTime(apt.endTime)}</span>
                      </div>
                    </div>

                    {/* Reason */}
                    {apt.reasonForVisit && (
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-[var(--color-text-muted)] mb-1">Reason for Visit:</p>
                        <p className="text-xs text-[var(--color-text-secondary)] bg-slate-50 p-2.5 rounded-lg border border-[var(--color-border)]">
                          {apt.reasonForVisit}
                        </p>
                      </div>
                    )}

                    {/* Rejection / Cancellation Reason */}
                    {apt.rejectionReason && (
                      <div className="mb-4 p-2.5 bg-rose-50 border border-rose-100 rounded-lg text-xs text-rose-700">
                        <span className="font-semibold">Note: </span>{apt.rejectionReason}
                      </div>
                    )}
                  </div>

                    {/* Actions */}
                    {(apt.status === 'PENDING' || apt.status === 'CONFIRMED') && (
                      <div className="pt-3 border-t border-[var(--color-border)] mt-2 flex justify-end">
                        {cancellingId === apt.id ? (
                          <div className="w-full space-y-2">
                            <input
                              type="text"
                              placeholder="Optional cancellation reason..."
                              value={cancelReason}
                              onChange={(e) => setCancelReason(e.target.value)}
                              className="w-full text-xs px-3 py-2 rounded-lg border border-[var(--color-border)] focus:outline-none focus:ring-1 focus:ring-red-400"
                            />
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => {
                                  setCancellingId(null);
                                  setCancelReason('');
                                }}
                                className="px-3 py-1.5 text-xs text-[var(--color-text-secondary)] hover:bg-slate-100 rounded-lg"
                              >
                                Back
                              </button>
                              <button
                                onClick={() => handleCancelAppointment(apt.id)}
                                disabled={isProcessingCancel}
                                className="px-3 py-1.5 text-xs bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-medium shadow-sm"
                              >
                                {isProcessingCancel ? 'Cancelling...' : 'Confirm Cancel'}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setCancellingId(apt.id)}
                            className="text-xs text-rose-600 hover:text-rose-700 font-semibold px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                          >
                            Cancel Appointment
                          </button>
                        )}
                      </div>
                    )}

                    {apt.status === 'COMPLETED' && (
                      <div className="pt-3 border-t border-[var(--color-border)] mt-2 flex justify-end">
                        <Link
                          to="/patient/prescriptions"
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition-colors"
                        >
                          <Pill className="w-3.5 h-3.5" /> View Digital Prescription (Rx)
                        </Link>
                      </div>
                    )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
