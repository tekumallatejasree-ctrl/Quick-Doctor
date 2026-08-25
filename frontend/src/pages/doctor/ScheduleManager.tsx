import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import LoadingSpinner from '@/components/LoadingSpinner';
import { doctorService } from '@/services/doctorService';
import type { DayScheduleItem } from '@/types';
import {
  Clock, Save, CheckCircle2, AlertCircle,
  CalendarCheck, ShieldCheck
} from 'lucide-react';

const DAYS_OF_WEEK = [
  { key: 'MONDAY', label: 'Monday' },
  { key: 'TUESDAY', label: 'Tuesday' },
  { key: 'WEDNESDAY', label: 'Wednesday' },
  { key: 'THURSDAY', label: 'Thursday' },
  { key: 'FRIDAY', label: 'Friday' },
  { key: 'SATURDAY', label: 'Saturday' },
  { key: 'SUNDAY', label: 'Sunday' },
];

export default function ScheduleManagerPage() {
  const [schedules, setSchedules] = useState<Record<string, DayScheduleItem>>({});
  const [slotDuration, setSlotDuration] = useState<number>(30);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    setIsLoading(true);
    try {
      const res = await doctorService.getAvailability();
      const loadedSchedules: Record<string, DayScheduleItem> = {};

      DAYS_OF_WEEK.forEach((d) => {
        const found = res.data.data?.find((s) => s.dayOfWeek === d.key);
        if (found) {
          loadedSchedules[d.key] = {
            dayOfWeek: found.dayOfWeek,
            startTime: found.startTime.substring(0, 5),
            endTime: found.endTime.substring(0, 5),
            slotDurationMinutes: found.slotDurationMinutes || 30,
            isActive: found.isActive,
          };
          if (found.slotDurationMinutes) {
            setSlotDuration(found.slotDurationMinutes);
          }
        } else {
          // Default inactive or standard hours
          loadedSchedules[d.key] = {
            dayOfWeek: d.key,
            startTime: '09:00',
            endTime: '17:00',
            slotDurationMinutes: 30,
            isActive: d.key !== 'SUNDAY',
          };
        }
      });

      setSchedules(loadedSchedules);
    } catch (err) {
      console.error('Failed to load schedule', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleDay = (dayKey: string) => {
    setSchedules((prev) => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        isActive: !prev[dayKey].isActive,
      },
    }));
  };

  const handleTimeChange = (dayKey: string, field: 'startTime' | 'endTime', value: string) => {
    setSchedules((prev) => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        [field]: value,
      },
    }));
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    setStatusMessage(null);

    const payloadList: DayScheduleItem[] = Object.values(schedules).map((s) => ({
      ...s,
      slotDurationMinutes: slotDuration,
    }));

    try {
      await doctorService.setAvailability({ schedules: payloadList });
      setStatusMessage({ text: 'Weekly availability schedule saved successfully!', type: 'success' });
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to save schedule.';
      setStatusMessage({ text: msg, type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-background)]">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto max-w-5xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-[var(--color-text)]">
                Schedule & Availability
              </h1>
              <p className="text-[var(--color-text-muted)] mt-1">
                Configure your working hours, clinic shifts, and consultation slot duration
              </p>
            </div>
            <button
              onClick={handleSaveAll}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-3 gradient-primary text-white rounded-xl text-sm font-semibold shadow-md hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isSaving ? <LoadingSpinner size="sm" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
          </div>

          {/* Flash Feedback */}
          {statusMessage && (
            <div className={`p-4 rounded-xl mb-6 text-sm flex items-center gap-2.5
              ${statusMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
              {statusMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {isLoading ? (
            <div className="py-16">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Slot Duration Global Setting */}
              <div className="bg-white rounded-2xl p-6 border border-[var(--color-border)] shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-[var(--color-text)]">Consultation Slot Duration</h3>
                    <p className="text-xs text-[var(--color-text-muted)]">Time allotted for each patient appointment</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  {[15, 20, 30, 45, 60].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setSlotDuration(mins)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-200
                        ${slotDuration === mins
                          ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-sm'
                          : 'bg-white text-[var(--color-text-secondary)] border-[var(--color-border)] hover:bg-[var(--color-surface-hover)]'
                        }`}
                    >
                      {mins} Minutes
                    </button>
                  ))}
                </div>
              </div>

              {/* Weekly Shifts Grid */}
              <div className="bg-white rounded-2xl p-6 border border-[var(--color-border)] shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <CalendarCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-[var(--color-text)]">Weekly Working Days & Hours</h3>
                    <p className="text-xs text-[var(--color-text-muted)]">Toggle active days and define start & end shifts</p>
                  </div>
                </div>

                <div className="space-y-4 divide-y divide-[var(--color-border)]">
                  {DAYS_OF_WEEK.map(({ key, label }) => {
                    const schedule = schedules[key] || {
                      dayOfWeek: key,
                      startTime: '09:00',
                      endTime: '17:00',
                      slotDurationMinutes: 30,
                      isActive: false,
                    };

                    return (
                      <div key={key} className="pt-4 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        {/* Day Toggle */}
                        <div className="flex items-center gap-4 min-w-40">
                          <input
                            type="checkbox"
                            id={`toggle-${key}`}
                            checked={schedule.isActive}
                            onChange={() => handleToggleDay(key)}
                            className="w-5 h-5 rounded text-[var(--color-primary)] focus:ring-[var(--color-primary)] cursor-pointer"
                          />
                          <label
                            htmlFor={`toggle-${key}`}
                            className={`text-sm font-bold cursor-pointer ${
                              schedule.isActive ? 'text-[var(--color-text)]' : 'text-[var(--color-text-muted)] line-through'
                            }`}
                          >
                            {label}
                          </label>
                        </div>

                        {/* Shift Times */}
                        {schedule.isActive ? (
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-[var(--color-text-muted)] font-medium">From:</span>
                              <input
                                type="time"
                                value={schedule.startTime}
                                onChange={(e) => handleTimeChange(key, 'startTime', e.target.value)}
                                className="px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                              />
                            </div>
                            <span className="text-[var(--color-text-muted)] text-sm">-</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-[var(--color-text-muted)] font-medium">To:</span>
                              <input
                                type="time"
                                value={schedule.endTime}
                                onChange={(e) => handleTimeChange(key, 'endTime', e.target.value)}
                                className="px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                            Day Off / Unavailable
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Safety notice banner */}
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-blue-800">
                <ShieldCheck className="w-5 h-5 flex-shrink-0 text-blue-600 mt-0.5" />
                <p>
                  Changing working hours will automatically update slot generation for future patient bookings. Any existing confirmed appointments will remain reserved.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
