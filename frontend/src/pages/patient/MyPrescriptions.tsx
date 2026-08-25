import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import LoadingSpinner from '@/components/LoadingSpinner';
import { prescriptionService } from '@/services/prescriptionService';
import type { Prescription } from '@/types';
import {
  Pill, FileText, Printer, X, Stethoscope
} from 'lucide-react';

export default function MyPrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRx, setSelectedRx] = useState<Prescription | null>(null);

  useEffect(() => {
    loadPrescriptions();
  }, []);

  const loadPrescriptions = async () => {
    setIsLoading(true);
    try {
      const res = await prescriptionService.getMyPrescriptions();
      setPrescriptions(res.data.data || []);
    } catch (err) {
      console.error('Failed to load prescriptions', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
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
              Digital Prescriptions
            </h1>
            <p className="text-[var(--color-text-muted)] mt-1">
              View and download your official doctor prescriptions and medicine schedules
            </p>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="py-16">
              <LoadingSpinner size="lg" />
            </div>
          ) : prescriptions.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-[var(--color-border)]">
              <Pill className="w-14 h-14 text-[var(--color-text-muted)] mx-auto mb-4" />
              <h3 className="text-lg font-bold text-[var(--color-text)]">No prescriptions found</h3>
              <p className="text-sm text-[var(--color-text-muted)] mt-1">
                Your prescriptions will appear here once your doctor completes a consultation.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {prescriptions.map((rx) => (
                <div
                  key={rx.id}
                  className="bg-white rounded-2xl p-6 border border-[var(--color-border)] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    {/* Top Row: Rx Number & Date */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                        {rx.prescriptionNumber}
                      </span>
                      <span className="text-xs text-[var(--color-text-muted)]">
                        {rx.createdAt ? new Date(rx.createdAt).toLocaleDateString() : ''}
                      </span>
                    </div>

                    {/* Doctor Info */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl gradient-primary text-white flex items-center justify-center flex-shrink-0">
                        <Stethoscope className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-[var(--color-text)]">{rx.doctorName}</h4>
                        <p className="text-xs text-[var(--color-primary)] font-medium">
                          {rx.doctorSpecialization || 'Clinical Practitioner'}
                        </p>
                      </div>
                    </div>

                    {/* Medicines preview */}
                    <div className="bg-slate-50 rounded-xl p-3.5 border border-[var(--color-border)] mb-4 text-xs space-y-1.5">
                      <p className="font-bold text-[var(--color-text)] flex items-center gap-1.5">
                        <Pill className="w-3.5 h-3.5 text-emerald-600" />
                        Prescribed Medicines ({rx.medicines?.length || 0})
                      </p>
                      <div className="text-[var(--color-text-secondary)] pl-5 space-y-1">
                        {rx.medicines?.slice(0, 3).map((m, i) => (
                          <div key={i} className="truncate font-medium">
                            • {m.medicineName} ({m.dosage}) — {m.frequency}
                          </div>
                        ))}
                        {(rx.medicines?.length || 0) > 3 && (
                          <p className="text-[var(--color-text-muted)] font-italic">
                            + {rx.medicines.length - 3} more item(s)...
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Advice note */}
                    {rx.adviceNotes && (
                      <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2 mb-4 bg-slate-50 p-2 rounded-lg border border-[var(--color-border)]">
                        <span className="font-semibold text-[var(--color-text)]">Advice: </span>
                        {rx.adviceNotes}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-[var(--color-border)] mt-2 flex justify-end">
                    <button
                      onClick={() => setSelectedRx(rx)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold gradient-primary text-white rounded-xl shadow-sm hover:opacity-90 transition-opacity"
                    >
                      <FileText className="w-3.5 h-3.5" /> View & Print Rx Slip
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Printable Prescription Modal */}
          {selectedRx && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
              <div className="bg-white rounded-3xl max-w-2xl w-full p-6 lg:p-8 shadow-2xl border border-[var(--color-border)] animate-fade-in my-8">
                {/* Modal Controls (Hidden in Print) */}
                <div className="flex justify-between items-center mb-6 print:hidden">
                  <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                    Official Medical Slip
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrint}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
                    >
                      <Printer className="w-3.5 h-3.5" /> Print / PDF
                    </button>
                    <button
                      onClick={() => setSelectedRx(null)}
                      className="p-2 hover:bg-slate-100 rounded-xl text-[var(--color-text-muted)] transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* --- Printable Slip Canvas --- */}
                <div className="p-6 border-2 border-slate-200 rounded-2xl bg-white space-y-6">
                  {/* Clinic Header */}
                  <div className="flex justify-between items-start border-b-2 border-slate-800 pb-4">
                    <div>
                      <h2 className="text-2xl font-black text-[var(--color-text)] tracking-tight">
                        Quick Doctor Clinic
                      </h2>
                      <p className="text-xs font-semibold text-emerald-700 mt-0.5">
                        {selectedRx.doctorName}
                      </p>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        {selectedRx.doctorQualification || 'MBBS, MD'} • {selectedRx.doctorSpecialization || 'General Medicine'}
                      </p>
                    </div>
                    <div className="text-right text-xs text-[var(--color-text-secondary)] space-y-0.5">
                      <p className="font-mono font-bold text-slate-800">{selectedRx.prescriptionNumber}</p>
                      <p>Date: {selectedRx.createdAt ? new Date(selectedRx.createdAt).toLocaleDateString() : ''}</p>
                    </div>
                  </div>

                  {/* Patient Info Bar */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex justify-between text-xs text-[var(--color-text)]">
                    <div>
                      <span className="font-semibold text-slate-500">Patient: </span>
                      <span className="font-bold">{selectedRx.patientName}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-500">Mobile: </span>
                      <span>{selectedRx.patientMobile || '—'}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-500">Ref Apt: </span>
                      <span className="font-mono font-medium">{selectedRx.appointmentNumber || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Rx Symbol & Medication Table */}
                  <div>
                    <div className="text-xl font-serif font-black text-slate-900 mb-2">℞</div>
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                          <tr>
                            <th className="p-2.5">#</th>
                            <th className="p-2.5">Medicine Name</th>
                            <th className="p-2.5">Dosage</th>
                            <th className="p-2.5">Frequency</th>
                            <th className="p-2.5">Duration</th>
                            <th className="p-2.5">Instructions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {selectedRx.medicines?.map((m, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50">
                              <td className="p-2.5 font-bold text-slate-400">{idx + 1}</td>
                              <td className="p-2.5 font-bold text-slate-800">{m.medicineName}</td>
                              <td className="p-2.5 font-semibold text-slate-700">{m.dosage}</td>
                              <td className="p-2.5">{m.frequency}</td>
                              <td className="p-2.5">{m.durationDays} Days</td>
                              <td className="p-2.5 text-slate-600">{m.instructions || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Advice Notes */}
                  {selectedRx.adviceNotes && (
                    <div className="bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-100 text-xs">
                      <p className="font-bold text-emerald-800 mb-1">Doctor's Advice & Care Instructions:</p>
                      <p className="text-emerald-950 font-medium">{selectedRx.adviceNotes}</p>
                    </div>
                  )}

                  {/* Follow up & Signature */}
                  <div className="flex justify-between items-end pt-6 border-t border-slate-200 text-xs">
                    <div>
                      {selectedRx.followUpDate && (
                        <div className="p-2 bg-blue-50 text-blue-800 rounded-lg font-semibold inline-block">
                          Follow-up on: {selectedRx.followUpDate}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="w-36 border-b border-slate-400 mb-1.5" />
                      <p className="font-bold text-slate-800">{selectedRx.doctorName}</p>
                      <p className="text-[10px] text-slate-400">Digitally Verified & Issued</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
