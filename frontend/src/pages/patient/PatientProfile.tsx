import { useState, useEffect } from 'react';
import { patientService } from '@/services/patientService';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import LoadingSpinner from '@/components/LoadingSpinner';
import type { PatientProfile, UpdatePatientProfile } from '@/types';
import { User, Mail, Phone, MapPin, AlertCircle as AlertTriangle, Save, CheckCircle2 } from 'lucide-react';

export default function PatientProfilePage() {
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState<UpdatePatientProfile>({});

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    try {
      const res = await patientService.getProfile();
      setProfile(res.data.data);
      setForm({
        fullName: res.data.data.fullName,
        mobile: res.data.data.mobile,
        address: res.data.data.address || '',
        emergencyContact: res.data.data.emergencyContact || '',
      });
    } catch { setError('Failed to load profile'); }
    finally { setIsLoading(false); }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    try {
      const res = await patientService.updateProfile(form);
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

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-background)]">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-3xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-[var(--color-text)]">My Profile</h1>
              <p className="text-[var(--color-text-muted)] mt-1">Manage your personal information</p>
            </div>

            {success && (
              <div className="flex items-center gap-2 p-3 mb-6 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-600">
                <CheckCircle2 className="w-4 h-4" /> {success}
              </div>
            )}
            {error && (
              <div className="flex items-center gap-2 p-3 mb-6 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                <AlertTriangle className="w-4 h-4" /> {error}
              </div>
            )}

            {/* Profile Card */}
            <div className="bg-white rounded-2xl border border-[var(--color-border)] overflow-hidden" style={{ boxShadow: 'var(--shadow-md)' }}>
              {/* Header */}
              <div className="gradient-primary p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/10 -mr-12 -mt-12" />
                <div className="relative flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center text-white text-3xl font-bold backdrop-blur-sm">
                    {profile?.fullName?.charAt(0) || 'P'}
                  </div>
                  <div className="text-white">
                    <h2 className="text-xl font-bold">{profile?.fullName}</h2>
                    <p className="text-blue-200">@{profile?.username}</p>
                  </div>
                </div>
              </div>

              {/* Fields */}
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-muted)] mb-2">
                      <User className="w-4 h-4" /> Full Name
                    </label>
                    {isEditing ? (
                      <input value={form.fullName || ''} onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                             className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]
                                        focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all" />
                    ) : (
                      <p className="text-[var(--color-text)] font-medium">{profile?.fullName}</p>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-muted)] mb-2">
                      <Mail className="w-4 h-4" /> Email
                    </label>
                    <p className="text-[var(--color-text)] font-medium">{profile?.email}</p>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-muted)] mb-2">
                      <Phone className="w-4 h-4" /> Mobile
                    </label>
                    {isEditing ? (
                      <input value={form.mobile || ''} onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                             className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]
                                        focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all" />
                    ) : (
                      <p className="text-[var(--color-text)] font-medium">{profile?.mobile || '—'}</p>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-muted)] mb-2">
                      <MapPin className="w-4 h-4" /> Address
                    </label>
                    {isEditing ? (
                      <input value={form.address || ''} onChange={(e) => setForm({ ...form, address: e.target.value })}
                             className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]
                                        focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all" />
                    ) : (
                      <p className="text-[var(--color-text)] font-medium">{profile?.address || '—'}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-muted)] mb-2">
                      <AlertTriangle className="w-4 h-4" /> Emergency Contact
                    </label>
                    {isEditing ? (
                      <input value={form.emergencyContact || ''} onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })}
                             className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]
                                        focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all" />
                    ) : (
                      <p className="text-[var(--color-text)] font-medium">{profile?.emergencyContact || '—'}</p>
                    )}
                  </div>
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
                              className="px-6 py-2.5 gradient-primary text-white rounded-xl text-sm font-medium
                                         hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50">
                        {isSaving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Changes
                      </button>
                    </>
                  ) : (
                    <button onClick={() => setIsEditing(true)}
                            className="px-6 py-2.5 gradient-primary text-white rounded-xl text-sm font-medium
                                       hover:opacity-90 transition-all">
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
