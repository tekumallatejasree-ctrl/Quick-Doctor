import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import LoadingSpinner from '@/components/LoadingSpinner';
import { consultationService } from '@/services/consultationService';
import { appointmentService } from '@/services/appointmentService';
import type { Appointment, PrescriptionMedicine } from '@/types';
import {
  User, Calendar, Clock, FileText, Pill, Plus, Trash2,
  CheckCircle2, AlertCircle, ArrowLeft, Send, Stethoscope
} from 'lucide-react';

const COMMON_FREQUENCIES = ['1-0-1 (Twice Daily)', '1-1-1 (Thrice Daily)', '1-0-0 (Morning)', '0-0-1 (Night)', 'SOS (As Needed)'];

export default function ConsultationRoomPage() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Clinical Form State
  const [symptoms, setSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [adviceNotes, setAdviceNotes] = useState('');

  // Medicines List
  const [medicines, setMedicines] = useState<PrescriptionMedicine[]>([
    { medicineName: '', dosage: '500mg', frequency: '1-0-1 (Twice Daily)', durationDays: 5, instructions: 'After meals' },
  ]);

  useEffect(() => {
    if (appointmentId) {
      loadEncounter(Number(appointmentId));
    }
  }, [appointmentId]);

  const loadEncounter = async (id: number) => {
    setIsLoading(true);
    try {
      // 1. Start or retrieve consultation
      const conRes = await consultationService.startConsultation(id);
      const c = conRes.data.data;

      // 2. Pre-fill clinical data if already present
      setSymptoms(c.symptoms || '');
      setDiagnosis(c.diagnosis || '');
      setClinicalNotes(c.clinicalNotes || '');
      setFollowUpDate(c.followUpDate || '');

      if (c.prescription) {
        setAdviceNotes(c.prescription.adviceNotes || '');
        if (c.prescription.medicines && c.prescription.medicines.length > 0) {
          setMedicines(c.prescription.medicines);
        }
      }

      // 3. Load appointment context
      const aptsRes = await appointmentService.getDoctorAppointments();
      const matched = aptsRes.data.data?.find((a) => a.id === id);
      if (matched) {
        setAppointment(matched);
        if (!c.symptoms && matched.reasonForVisit) {
          setSymptoms(matched.reasonForVisit);
        }
      }
    } catch (err: any) {
      console.error('Failed to load consultation encounter', err);
      setErrorMessage(err.response?.data?.message || 'Failed to initialize consultation session.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMedicine = () => {
    setMedicines((prev) => [
      ...prev,
      { medicineName: '', dosage: '500mg', frequency: '1-0-1 (Twice Daily)', durationDays: 5, instructions: 'After meals' },
    ]);
  };

  const handleRemoveMedicine = (index: number) => {
    setMedicines((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMedicineChange = (index: number, field: keyof PrescriptionMedicine, value: any) => {
    setMedicines((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleCompleteConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!diagnosis.trim()) {
      setErrorMessage('Please provide a Diagnosis or Clinical Assessment.');
      return;
    }

    // Filter valid medicines
    const validMedicines = medicines.filter((m) => m.medicineName.trim().length > 0);

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await consultationService.completeConsultation(Number(appointmentId), {
        symptoms: symptoms.trim() || undefined,
        diagnosis: diagnosis.trim(),
        clinicalNotes: clinicalNotes.trim() || undefined,
        followUpDate: followUpDate || undefined,
        adviceNotes: adviceNotes.trim() || undefined,
        medicines: validMedicines.length > 0 ? validMedicines : undefined,
      });

      setSuccessMessage('Consultation successfully completed and prescription generated!');
      setTimeout(() => {
        navigate('/doctor/appointments');
      }, 1500);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to save consultation.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--color-background)]">
        <Navbar />
        <div className="flex flex-1"><Sidebar /><div className="flex-1"><LoadingSpinner size="lg" /></div></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-background)]">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto max-w-6xl">
          {/* Back link */}
          <Link
            to="/doctor/appointments"
            className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Appointments
          </Link>

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-[var(--color-text)] flex items-center gap-2.5">
                <Stethoscope className="w-7 h-7 text-[var(--color-primary)]" />
                Clinical Consultation Room
              </h1>
              <p className="text-[var(--color-text-muted)] mt-1">
                Encounter for {appointment?.patientName || 'Patient'} ({appointment?.appointmentNumber})
              </p>
            </div>
            <span className="px-3.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200 self-start sm:self-auto">
              Live Session
            </span>
          </div>

          {/* Messages */}
          {errorMessage && (
            <div className="p-4 rounded-xl mb-6 bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}
          {successMessage && (
            <div className="p-4 rounded-xl mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Patient Overview Strip */}
          <div className="bg-white rounded-2xl p-5 border border-[var(--color-border)] shadow-sm mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[var(--color-text)]">{appointment?.patientName}</h3>
                <p className="text-xs text-[var(--color-text-muted)]">{appointment?.patientMobile || appointment?.patientEmail || 'Patient Record'}</p>
              </div>
            </div>

            <div className="flex items-center gap-6 text-xs text-[var(--color-text-secondary)]">
              <div className="flex items-center gap-1.5 font-semibold">
                <Calendar className="w-4 h-4 text-[var(--color-primary)]" />
                <span>{appointment?.appointmentDate}</span>
              </div>
              <div className="flex items-center gap-1.5 font-semibold">
                <Clock className="w-4 h-4 text-[var(--color-primary)]" />
                <span>{appointment?.startTime?.substring(0, 5)} - {appointment?.endTime?.substring(0, 5)}</span>
              </div>
            </div>
          </div>

          {/* Clinical Form */}
          <form onSubmit={handleCompleteConsultation} className="space-y-6">
            {/* Section 1: Assessment & Notes */}
            <div className="bg-white rounded-2xl p-6 lg:p-8 border border-[var(--color-border)] shadow-sm space-y-5">
              <div className="flex items-center gap-2.5 border-b border-[var(--color-border)] pb-3">
                <FileText className="w-5 h-5 text-[var(--color-primary)]" />
                <h2 className="text-lg font-bold text-[var(--color-text)]">1. Clinical Assessment & Diagnosis</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text)] uppercase tracking-wider mb-2">
                    Patient Symptoms & Complaints
                  </label>
                  <textarea
                    rows={3}
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    placeholder="Observed symptoms, fever duration, cough, pain level..."
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--color-text)] uppercase tracking-wider mb-2">
                    Diagnosis / Clinical Impression <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    placeholder="e.g., Acute Upper Respiratory Tract Infection, Hypertension Stage 1..."
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--color-text)] uppercase tracking-wider mb-2">
                  Clinical Examination & Treatment Notes
                </label>
                <textarea
                  rows={2}
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  placeholder="BP: 120/80 mmHg, Pulse: 72 bpm, SpO2: 99%, chest clear..."
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text)] uppercase tracking-wider mb-2">
                    Follow-Up Consultation Date (Optional)
                  </label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--color-text)] uppercase tracking-wider mb-2">
                    Dietary & Lifestyle Advice
                  </label>
                  <input
                    type="text"
                    value={adviceNotes}
                    onChange={(e) => setAdviceNotes(e.target.value)}
                    placeholder="Drink plenty of fluids, rest for 3 days, avoid cold foods"
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Prescription Builder */}
            <div className="bg-white rounded-2xl p-6 lg:p-8 border border-[var(--color-border)] shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
                <div className="flex items-center gap-2.5">
                  <Pill className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-lg font-bold text-[var(--color-text)]">2. Digital Prescription (Rx)</h2>
                </div>
                <button
                  type="button"
                  onClick={handleAddMedicine}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Medicine
                </button>
              </div>

              {medicines.map((med, index) => (
                <div key={index} className="p-4 rounded-xl bg-slate-50 border border-[var(--color-border)] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--color-text-muted)]">Medicine #{index + 1}</span>
                    {medicines.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMedicine(index)}
                        className="text-xs text-rose-600 hover:text-rose-700 p-1 flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Medicine Name */}
                    <div className="lg:col-span-1">
                      <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">
                        Medicine Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Paracetamol"
                        value={med.medicineName}
                        onChange={(e) => handleMedicineChange(index, 'medicineName', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] text-xs font-semibold bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    {/* Dosage */}
                    <div>
                      <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">
                        Dosage / Strength
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 500mg or 5ml"
                        value={med.dosage}
                        onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] text-xs bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    {/* Frequency */}
                    <div>
                      <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">
                        Frequency
                      </label>
                      <select
                        value={med.frequency}
                        onChange={(e) => handleMedicineChange(index, 'frequency', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] text-xs bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      >
                        {COMMON_FREQUENCIES.map((freq) => (
                          <option key={freq} value={freq}>{freq}</option>
                        ))}
                      </select>
                    </div>

                    {/* Duration */}
                    <div>
                      <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">
                        Duration (Days)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={90}
                        value={med.durationDays}
                        onChange={(e) => handleMedicineChange(index, 'durationDays', Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] text-xs bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Special Instructions */}
                  <div>
                    <input
                      type="text"
                      placeholder="Instructions (e.g. Take after breakfast and dinner with warm water)"
                      value={med.instructions || ''}
                      onChange={(e) => handleMedicineChange(index, 'instructions', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Actions Bar */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
              <Link
                to="/doctor/appointments"
                className="px-6 py-3 rounded-xl border border-[var(--color-border)] text-sm font-semibold text-[var(--color-text-secondary)] hover:bg-slate-100 transition-colors text-center"
              >
                Save as Draft & Exit
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 gradient-primary text-white rounded-xl text-sm font-bold shadow-md hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Complete Consultation & Issue Rx
                  </>
                )}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
