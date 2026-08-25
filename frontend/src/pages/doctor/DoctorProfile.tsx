import { useState, useEffect } from 'react';
import { doctorService } from '@/services/doctorService';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import LoadingSpinner from '@/components/LoadingSpinner';
import type { DoctorProfile, UpdateDoctorProfile } from '@/types';
import {
  User, Mail, Phone, GraduationCap, Stethoscope, Clock,
  IndianRupee, Languages, CreditCard, Save, CheckCircle2, AlertCircle
} from 'lucide-react';

export default function DoctorProfilePage() {
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState<UpdateDoctorProfile>({});

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    try {
      const res = await doctorService.getProfile();
      const p = res.data.data;
      setProfile(p);
      setForm({
        name: p.name,
        qualification: p.qualification, specialization: p.specialization,
        experience: p.experience, consultationFee: p.consultationFee,
        languagesKnown: p.languagesKnown, upiId: p.upiId || '',
        bio: p.bio || '', mobile: p.mobile,
      });
    } catch { setError('Failed to load profile'); }
    finally { setIsLoading(false); }
  };

  const handleSave = async () => {
    setIsSaving(true); setError('');
    try {
      const res = await doctorService.updateProfile(form);
      setProfile(res.data.data);
      setIsEditing(false);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch { setError('Failed to update profile'); }
    finally { setIsSaving(false); }
  };

  if (isLoading) return (
    <div className="min-h-screen flex flex-col"><Navbar /><div className="flex flex-1"><Sidebar /><div className="flex-1"><LoadingSpinner size="lg" /></div></div></div>
  );

  const fields = [
    { icon: User, label: 'Full Name', key: 'name' as const, editable: true },
    { icon: GraduationCap, label: 'Qualification', key: 'qualification' as const, editable: true },
    { icon: Stethoscope, label: 'Specialization', key: 'specialization' as const, editable: true },
    { icon: Clock, label: 'Experience (years)', key: 'experience' as const, editable: true, type: 'number' },
    { icon: IndianRupee, label: 'Consultation Fee (₹)', key: 'consultationFee' as const, editable: true, type: 'number' },
    { icon: Phone, label: 'Mobile', key: 'mobile' as const, editable: true },
    { icon: Languages, label: 'Languages Known', key: 'languagesKnown' as const, editable: true },
    { icon: CreditCard, label: 'UPI ID', key: 'upiId' as const, editable: true },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-background)]">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-3xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-[var(--color-text)]">Doctor Profile</h1>
              <p className="text-[var(--color-text-muted)] mt-1">Manage your professional information</p>
            </div>

            {success && (
              <div className="flex items-center gap-2 p-3 mb-6 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-600">
                <CheckCircle2 className="w-4 h-4" /> {success}
              </div>
            )}
            {error && (
              <div className="flex items-center gap-2 p-3 mb-6 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            )}

            <div className="bg-white rounded-2xl border border-[var(--color-border)] overflow-hidden" style={{ boxShadow: 'var(--shadow-md)' }}>
              {/* Header */}
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/10 -mr-12 -mt-12" />
                <div className="relative flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center text-white text-3xl font-bold backdrop-blur-sm">
                    {profile?.name?.charAt(0) || 'D'}
                  </div>
                  <div className="text-white">
                    <h2 className="text-xl font-bold">{profile?.name}</h2>
                    <p className="text-emerald-100">{profile?.specialization}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Mail className="w-3.5 h-3.5" />
                      <span className="text-sm text-emerald-100">{profile?.email}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fields */}
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {fields.map(({ icon: Icon, label, key, editable, type }) => (
                    <div key={key}>
                      <label className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-muted)] mb-2">
                        <Icon className="w-4 h-4" /> {label}
                      </label>
                      {isEditing && editable ? (
                        <input
                          type={type || 'text'}
                          value={form[key] ?? ''}
                          onChange={(e) => setForm({ ...form, [key]: type === 'number' ? Number(e.target.value) : e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]
                                     focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                        />
                      ) : (
                        <p className="text-[var(--color-text)] font-medium">
                          {key === 'consultationFee' ? `₹${profile?.[key]}` : (String(profile?.[key] ?? '—'))}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Bio */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-muted)] mb-2">
                    <User className="w-4 h-4" /> Bio
                  </label>
                  {isEditing ? (
                    <textarea value={form.bio || ''} onChange={(e) => setForm({ ...form, bio: e.target.value })}
                              rows={4}
                              className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]
                                         focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none" />
                  ) : (
                    <p className="text-[var(--color-text)]">{profile?.bio || '—'}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
                  {isEditing ? (
                    <>
                      <button onClick={() => setIsEditing(false)}
                              className="px-6 py-2.5 rounded-xl text-sm font-medium border border-[var(--color-border)]
                                         text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] transition-all">
                        Cancel
                      </button>
                      <button onClick={handleSave} disabled={isSaving}
                              className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium
                                         hover:bg-emerald-700 transition-all flex items-center gap-2 disabled:opacity-50">
                        {isSaving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Changes
                      </button>
                    </>
                  ) : (
                    <button onClick={() => setIsEditing(true)}
                            className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium
                                       hover:bg-emerald-700 transition-all">
                      Edit Profile
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
