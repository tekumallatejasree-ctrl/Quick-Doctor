import { useState, useEffect } from 'react';
import { patientService } from '@/services/patientService';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import DoctorCard from '@/components/DoctorCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import type { DoctorProfile } from '@/types';
import { Search, Stethoscope } from 'lucide-react';

export default function DoctorsListPage() {
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<DoctorProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { loadDoctors(); }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredDoctors(doctors);
      return;
    }
    const lower = searchTerm.toLowerCase();
    setFilteredDoctors(
      doctors.filter(
        (d) =>
          d.name.toLowerCase().includes(lower) ||
          d.specialization.toLowerCase().includes(lower) ||
          d.qualification.toLowerCase().includes(lower)
      )
    );
  }, [searchTerm, doctors]);

  const loadDoctors = async () => {
    try {
      const res = await patientService.getDoctors();
      setDoctors(res.data.data);
      setFilteredDoctors(res.data.data);
    } catch { console.error('Failed to load doctors'); }
    finally { setIsLoading(false); }
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
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[var(--color-text)]">Find a Doctor</h1>
            <p className="text-[var(--color-text-muted)] mt-1">Browse our qualified medical professionals</p>
          </div>

          {/* Search */}
          <div className="relative mb-8 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, specialization..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-[var(--color-border)] bg-white
                         text-[var(--color-text)] placeholder-[var(--color-text-muted)]
                         focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
            />
          </div>

          {/* Results */}
          {filteredDoctors.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-[var(--color-border)]">
              <Stethoscope className="w-12 h-12 text-[var(--color-text-muted)] mx-auto mb-4" />
              <p className="text-[var(--color-text-secondary)]">
                {searchTerm ? 'No doctors match your search' : 'No doctors available'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredDoctors.map((doctor) => (
                <DoctorCard key={doctor.id} doctor={doctor} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
