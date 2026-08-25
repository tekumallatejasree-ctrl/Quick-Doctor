import type { LucideIcon } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  description?: string;
}

export default function DashboardCard({ title, value, icon: Icon, color, bgColor, description }: DashboardCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-[var(--color-border)] hover:border-[var(--color-primary-200)]
                    transition-all duration-300 hover:shadow-lg group cursor-default"
         style={{ boxShadow: 'var(--shadow-sm)' }}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-[var(--color-text-muted)] mb-1">{title}</p>
          <p className="text-3xl font-bold text-[var(--color-text)] tracking-tight">{value}</p>
          {description && (
            <p className="text-xs text-[var(--color-text-muted)] mt-2">{description}</p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center
                        group-hover:scale-110 transition-transform duration-300`}
             style={{ backgroundColor: bgColor }}>
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
      </div>
    </div>
  );
}
