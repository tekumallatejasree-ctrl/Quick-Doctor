import type { DoctorProfile } from '@/types';
import { Stethoscope, GraduationCap, Clock, Languages, IndianRupee } from 'lucide-react';

interface DoctorCardProps {
  doctor: DoctorProfile;
  onBook?: () => void;
}

export default function DoctorCard({ doctor, onBook }: DoctorCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-[var(--color-border)] overflow-hidden
                    hover:border-[var(--color-primary-200)] hover:shadow-xl transition-all duration-300 group">
      {/* Header with gradient */}
      <div className="gradient-primary p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 -mr-10 -mt-10" />
        <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/5 -ml-8 -mb-8" />

        <div className="relative flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-white
                          text-2xl font-bold backdrop-blur-sm">
            {doctor.name.charAt(0)}
          </div>
          <div className="text-white">
            <h3 className="text-lg font-bold">{doctor.name}</h3>
            <p className="text-blue-100 text-sm">{doctor.specialization}</p>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
            <GraduationCap className="w-4 h-4 text-[var(--color-primary)]" />
            <span className="truncate">{doctor.qualification}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
            <Clock className="w-4 h-4 text-[var(--color-primary)]" />
            <span>{doctor.experience} yrs exp</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
            <Stethoscope className="w-4 h-4 text-[var(--color-primary)]" />
            <span className="truncate">{doctor.specialization}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
            <Languages className="w-4 h-4 text-[var(--color-primary)]" />
            <span className="truncate">{doctor.languagesKnown}</span>
          </div>
        </div>

        {doctor.bio && (
          <p className="text-sm text-[var(--color-text-muted)] line-clamp-2 leading-relaxed">
            {doctor.bio}
          </p>
        )}

        {/* Fee & Book */}
        <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
          <div className="flex items-center gap-1">
            <IndianRupee className="w-4 h-4 text-[var(--color-success)]" />
            <span className="text-lg font-bold text-[var(--color-text)]">₹{doctor.consultationFee}</span>
            <span className="text-xs text-[var(--color-text-muted)]">/ consultation</span>
          </div>
          <button
            onClick={onBook}
            className="px-5 py-2.5 gradient-primary text-white text-sm font-medium rounded-xl
                       hover:opacity-90 transition-all duration-200 shadow-md hover:shadow-lg
                       active:scale-95"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}
