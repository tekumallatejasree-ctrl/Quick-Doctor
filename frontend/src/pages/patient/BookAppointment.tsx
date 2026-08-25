import { useState, useEffect, useId } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import LoadingSpinner from '@/components/LoadingSpinner';
import { doctorService } from '@/services/doctorService';
import { appointmentService } from '@/services/appointmentService';
import type { DoctorProfile, TimeSlot } from '@/types';
import {
  Calendar, Clock, CheckCircle2, AlertCircle, Stethoscope,
  ChevronRight, ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function BookAppointmentPage() {
  const dateInputId = useId();
  const reasonInputId = useId();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState<DoctorProfile | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [isLoadingDoctor, setIsLoadingDoctor] = useState(true);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ number: string; date: string; time: string } | null>(null);

  // Load doctor details
  useEffect(() => {
    loadDoctor();
  }, []);

  // Load slots whenever selected date changes
  useEffect(() => {
    if (selectedDate) {
      loadSlots(selectedDate);
    }
  }, [selectedDate]);

  const loadDoctor = async () => {
    try {
      const res = await doctorService.getPublicProfile();
      setDoctor(res.data.data);
    } catch (err) {
      console.error('Failed to load doctor profile', err);
      setErrorMessage('Could not load clinic doctor information.');
    } finally {
      setIsLoadingDoctor(false);
    }
  };

  const loadSlots = async (date: string) => {
    setIsLoadingSlots(true);
    setSelectedSlot(null);
    setErrorMessage(null);
    try {
      const res = await doctorService.getAvailableSlots(date);
      setSlots(res.data.data || []);
    } catch (err) {
      console.error('Failed to load slots', err);
      setSlots([]);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) {
      setErrorMessage('Please select an available time slot.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await appointmentService.bookAppointment({
        appointmentDate: selectedDate,
        startTime: selectedSlot,
        reasonForVisit: reason.trim() || undefined,
      });

      const booked = res.data.data;
      setSuccessData({
        number: booked.appointmentNumber,
        date: booked.appointmentDate,
        time: booked.startTime.substring(0, 5),
      });
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to book appointment. Please try again.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format time display (e.g. 09:00:00 -> 9:00 AM)
  const formatTime = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${m.toString().padStart(2, '0')} ${period}`;
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-background)]">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto max-w-5xl">
          {/* Back link */}
          <Link
            to="/patient/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>

          {/* Title */}
          <div className="mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold text-[var(--color-text)]">
              Book a Consultation
            </h1>
            <p className="text-[var(--color-text-muted)] mt-1">
              Select an available date and time slot with our clinic doctor
            </p>
          </div>

          {/* Success Banner / Modal */}
          {successData ? (
            <div className="bg-white rounded-3xl p-8 lg:p-10 border border-emerald-200 shadow-xl text-center max-w-xl mx-auto animate-fade-in">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-[var(--color-text)] mb-2">
                Appointment Requested!
              </h2>
              <p className="text-[var(--color-text-muted)] mb-6">
                Your consultation request has been submitted and is pending confirmation from Dr. {doctor?.name}.
              </p>

              <div className="bg-slate-50 rounded-2xl p-4 mb-6 text-left border border-[var(--color-border)] space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">Booking ID:</span>
                  <span className="font-semibold text-[var(--color-text)]">{successData.number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">Date:</span>
                  <span className="font-semibold text-[var(--color-text)]">{successData.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">Time:</span>
                  <span className="font-semibold text-[var(--color-text)]">{formatTime(successData.time)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">Consultation Fee:</span>
                  <span className="font-semibold text-emerald-600">₹{doctor?.consultationFee ?? 500}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => navigate('/patient/appointments')}
                  className="px-6 py-3 gradient-primary text-white rounded-xl font-medium shadow-md hover:opacity-90 transition-opacity"
                >
                  View My Appointments
                </button>
                <button
                  onClick={() => {
                    setSuccessData(null);
                    setSelectedSlot(null);
                    setReason('');
                  }}
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-[var(--color-text)] rounded-xl font-medium transition-colors"
                >
                  Book Another Slot
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Doctor Summary Card */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl p-6 border border-[var(--color-border)] shadow-sm sticky top-24">
                  {isLoadingDoctor ? (
                    <LoadingSpinner size="md" />
                  ) : doctor ? (
                    <div>
                      <div className="flex items-center gap-3.5 mb-4">
                        <div className="w-14 h-14 rounded-2xl gradient-primary text-white flex items-center justify-center flex-shrink-0 shadow-md">
                          <Stethoscope className="w-7 h-7" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-[var(--color-text)] leading-tight">
                            {doctor.name}
                          </h3>
                          <p className="text-xs font-medium text-[var(--color-primary)] mt-0.5">
                            {doctor.specialization || 'General Physician'}
                          </p>
                        </div>
                      </div>

                      <div className="border-t border-[var(--color-border)] pt-4 space-y-2.5 text-xs text-[var(--color-text-secondary)]">
                        <div className="flex justify-between">
                          <span className="text-[var(--color-text-muted)]">Qualification:</span>
                          <span className="font-medium text-[var(--color-text)] text-right">{doctor.qualification}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[var(--color-text-muted)]">Experience:</span>
                          <span className="font-medium text-[var(--color-text)]">{doctor.experience} Years</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[var(--color-text-muted)]">Consultation Fee:</span>
                          <span className="font-bold text-emerald-600 text-sm">₹{doctor.consultationFee}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[var(--color-text-muted)]">Languages:</span>
                          <span className="font-medium text-[var(--color-text)]">{doctor.languagesKnown || 'English'}</span>
                        </div>
                      </div>

                      {doctor.bio && (
                        <p className="mt-4 pt-3 border-t border-[var(--color-border)] text-xs text-[var(--color-text-muted)] line-clamp-4">
                          {doctor.bio}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-[var(--color-text-muted)]">Doctor info unavailable</p>
                  )}
                </div>
              </div>

              {/* Booking Form */}
              <div className="lg:col-span-2 space-y-6">
                <form onSubmit={handleBooking} className="bg-white rounded-2xl p-6 lg:p-8 border border-[var(--color-border)] shadow-sm space-y-6">
                  {errorMessage && (
                    <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2.5">
                      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Step 1: Select Date */}
                  <div>
                    <label htmlFor={dateInputId} className="block text-sm font-semibold text-[var(--color-text)] mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[var(--color-primary)]" />
                      1. Select Consultation Date
                    </label>
                    <input
                      id={dateInputId}
                      type="date"
                      min={todayStr}
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full sm:w-72 px-4 py-3 rounded-xl border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm font-medium"
                      required
                    />
                  </div>

                  {/* Step 2: Available Slots */}
                  <div>
                    <label className="block text-sm font-semibold text-[var(--color-text)] mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[var(--color-primary)]" />
                      2. Choose a Time Slot
                    </label>

                    {isLoadingSlots ? (
                      <div className="py-8">
                        <LoadingSpinner size="md" />
                      </div>
                    ) : slots.length === 0 ? (
                      <div className="p-6 rounded-xl bg-slate-50 border border-[var(--color-border)] text-center text-sm text-[var(--color-text-muted)]">
                        No slots available on this date. The doctor might be off or all slots are fully booked.
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                        {slots.map((slot) => {
                          const timeDisplay = formatTime(slot.startTime);
                          const isSelected = selectedSlot === slot.startTime;

                          return (
                            <button
                              key={slot.startTime}
                              type="button"
                              disabled={!slot.isAvailable}
                              onClick={() => setSelectedSlot(slot.startTime)}
                              className={`py-3 px-2 rounded-xl text-xs font-semibold border transition-all duration-200 text-center
                                ${!slot.isAvailable
                                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through'
                                  : isSelected
                                  ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-md scale-105'
                                  : 'bg-white hover:border-[var(--color-primary)] text-[var(--color-text)] border-[var(--color-border)] hover:shadow-sm'
                                }`}
                            >
                              {timeDisplay}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Step 3: Reason for Consultation */}
                  <div>
                    <label htmlFor={reasonInputId} className="block text-sm font-semibold text-[var(--color-text)] mb-2">
                      3. Symptoms / Reason for Visit (Optional)
                    </label>
                    <textarea
                      id={reasonInputId}
                      rows={3}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Briefly describe your symptoms, questions, or medical concerns..."
                      className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || !selectedSlot}
                    className="w-full py-3.5 gradient-primary text-white rounded-xl font-semibold shadow-md hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      'Booking Consultation...'
                    ) : (
                      <>
                        Confirm Consultation Request
                        <ChevronRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
