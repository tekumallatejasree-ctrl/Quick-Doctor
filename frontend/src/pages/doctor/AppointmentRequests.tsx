import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import LoadingSpinner from '@/components/LoadingSpinner';
import { appointmentService } from '@/services/appointmentService';
import type { Appointment, AppointmentStatus } from '@/types';
import {
  CalendarDays, Clock, User, Phone, Check, X,
  AlertCircle, CheckCircle2, Inbox, Stethoscope
} from 'lucide-react';

export default function AppointmentRequestsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'PENDING' | 'TODAY' | 'CONFIRMED' | 'ALL'>('PENDING');
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    setIsLoading(true);
    try {
      const res = await appointmentService.getDoctorAppointments();
      setAppointments(res.data.data || []);
    } catch (err) {
      console.error('Failed to load doctor appointments', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (id: number, status: AppointmentStatus, reason?: string) => {
    setIsProcessing(true);
    setFeedback(null);
    try {
      await appointmentService.updateStatus(id, {
        status,
        rejectionReason: reason,
      });

      setFeedback({
        text: `Appointment successfully marked as ${status.toLowerCase()}.`,
        type: 'success',
      });
      setRejectingId(null);
      setRejectionReason('');
      loadAppointments();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to update appointment status.';
      setFeedback({ text: msg, type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredAppointments = appointments.filter((apt) => {
    if (activeFilter === 'PENDING') return apt.status === 'PENDING';
    if (activeFilter === 'TODAY') return apt.appointmentDate === todayStr;
    if (activeFilter === 'CONFIRMED') return apt.status === 'CONFIRMED';
    return true; // ALL
  });

  const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${m.toString().padStart(2, '0')} ${period}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-background)]">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold text-[var(--color-text)]">
              Appointment Management
            </h1>
            <p className="text-[var(--color-text-muted)] mt-1">
              Review consultation requests, confirm patient slots, and manage clinic queue
            </p>
          </div>

          {/* Feedback message */}
          {feedback && (
            <div className={`p-4 rounded-xl mb-6 text-sm flex items-center justify-between
              ${feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
              <div className="flex items-center gap-2">
                {feedback.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                <span>{feedback.text}</span>
              </div>
              <button onClick={() => setFeedback(null)} className="p-1 hover:opacity-70">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Filter Pills */}
          <div className="flex overflow-x-auto gap-2 pb-2 mb-6 border-b border-[var(--color-border)]">
            <button
              onClick={() => setActiveFilter('PENDING')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200
                ${activeFilter === 'PENDING'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]'
                }`}
            >
              Pending Requests ({appointments.filter(a => a.status === 'PENDING').length})
            </button>
            <button
              onClick={() => setActiveFilter('TODAY')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200
                ${activeFilter === 'TODAY'
                  ? 'bg-[var(--color-primary)] text-white shadow-sm'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]'
                }`}
            >
              Today's Queue ({appointments.filter(a => a.appointmentDate === todayStr).length})
            </button>
            <button
              onClick={() => setActiveFilter('CONFIRMED')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200
                ${activeFilter === 'CONFIRMED'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]'
                }`}
            >
              Confirmed ({appointments.filter(a => a.status === 'CONFIRMED').length})
            </button>
            <button
              onClick={() => setActiveFilter('ALL')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200
                ${activeFilter === 'ALL'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]'
                }`}
            >
              All Records ({appointments.length})
            </button>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="py-16">
              <LoadingSpinner size="lg" />
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-[var(--color-border)]">
              <Inbox className="w-14 h-14 text-[var(--color-text-muted)] mx-auto mb-4" />
              <h3 className="text-lg font-bold text-[var(--color-text)]">No appointments found</h3>
              <p className="text-sm text-[var(--color-text-muted)] mt-1">
                There are currently no appointments under this filter view.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="bg-white rounded-2xl p-6 border border-[var(--color-border)] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-mono font-semibold text-[var(--color-text-muted)]">
                        {apt.appointmentNumber}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border
                        ${apt.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : apt.status === 'CONFIRMED' ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : apt.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'}`}
                      >
                        {apt.status}
                      </span>
                    </div>

                    {/* Patient Details */}
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-[var(--color-text)] text-base">{apt.patientName}</h4>
                        {apt.patientMobile && (
                          <p className="text-xs text-[var(--color-text-muted)] flex items-center gap-1.5 mt-0.5">
                            <Phone className="w-3.5 h-3.5" /> {apt.patientMobile}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Date & Time Badge */}
                    <div className="bg-slate-50 rounded-xl p-3 border border-[var(--color-border)] mb-4 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 font-semibold text-[var(--color-text)]">
                        <CalendarDays className="w-4 h-4 text-[var(--color-primary)]" />
                        <span>{apt.appointmentDate}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-semibold text-[var(--color-text)]">
                        <Clock className="w-4 h-4 text-[var(--color-primary)]" />
                        <span>{formatTime(apt.startTime)} - {formatTime(apt.endTime)}</span>
                      </div>
                    </div>

                    {/* Reason */}
                    {apt.reasonForVisit && (
                      <div className="mb-4 text-xs">
                        <span className="font-semibold text-[var(--color-text-muted)]">Symptoms / Reason: </span>
                        <p className="text-[var(--color-text-secondary)] mt-1 p-2 bg-slate-50 rounded-lg border border-[var(--color-border)]">
                          {apt.reasonForVisit}
                        </p>
                      </div>
                    )}

                    {/* Rejection Note */}
                    {apt.rejectionReason && (
                      <div className="mb-4 text-xs p-2 bg-rose-50 text-rose-700 rounded-lg border border-rose-200">
                        <span className="font-semibold">Note: </span>{apt.rejectionReason}
                      </div>
                    )}
                  </div>

                  {/* Actions for Doctor */}
                  <div className="pt-3 border-t border-[var(--color-border)] mt-2">
                    {apt.status === 'PENDING' && (
                      rejectingId === apt.id ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            placeholder="Reason for declining..."
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            className="w-full text-xs px-3 py-2 rounded-lg border border-[var(--color-border)] focus:outline-none focus:ring-1 focus:ring-red-400"
                          />
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => {
                                setRejectingId(null);
                                setRejectionReason('');
                              }}
                              className="px-3 py-1.5 text-xs text-[var(--color-text-secondary)] hover:bg-slate-100 rounded-lg"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(apt.id, 'REJECTED', rejectionReason)}
                              disabled={isProcessing}
                              className="px-3 py-1.5 text-xs bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-medium shadow-sm"
                            >
                              {isProcessing ? 'Saving...' : 'Decline Request'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => setRejectingId(apt.id)}
                            disabled={isProcessing}
                            className="px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200 transition-colors flex items-center gap-1.5"
                          >
                            <X className="w-3.5 h-3.5" /> Decline
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(apt.id, 'CONFIRMED')}
                            disabled={isProcessing}
                            className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
                          >
                            <Check className="w-3.5 h-3.5" /> Accept Slot
                          </button>
                        </div>
                      )
                    )}

                    {apt.status === 'CONFIRMED' && (
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/doctor/consultation/${apt.id}`}
                          className="px-4 py-2 text-xs font-bold text-white gradient-primary hover:opacity-90 rounded-xl shadow-sm transition-opacity flex items-center gap-1.5"
                        >
                          <Stethoscope className="w-3.5 h-3.5" /> Start Consultation (Rx)
                        </Link>
                      </div>
                    )}

                    {apt.status === 'COMPLETED' && (
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/doctor/consultation/${apt.id}`}
                          className="px-3.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition-colors flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> View Encounter & Rx
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
