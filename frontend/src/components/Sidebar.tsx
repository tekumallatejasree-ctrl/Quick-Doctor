import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard, User, Bell, Stethoscope,
  CalendarDays, Heart, ChevronLeft, ChevronRight,
  Clock, PlusCircle, Inbox, Pill
} from 'lucide-react';
import { useState } from 'react';

export default function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isDoctor = user?.role === 'DOCTOR';
  const prefix = isDoctor ? '/doctor' : '/patient';

  const menuItems = isDoctor
    ? [
        { icon: LayoutDashboard, label: 'Dashboard', path: `${prefix}/dashboard` },
        { icon: Inbox, label: 'Appointments', path: `${prefix}/appointments` },
        { icon: Clock, label: 'Schedule', path: `${prefix}/schedule` },
        { icon: User, label: 'Profile', path: `${prefix}/profile` },
        { icon: Bell, label: 'Notifications', path: `${prefix}/notifications` },
      ]
    : [
        { icon: LayoutDashboard, label: 'Dashboard', path: `${prefix}/dashboard` },
        { icon: PlusCircle, label: 'Book Slot', path: `${prefix}/book` },
        { icon: CalendarDays, label: 'My Bookings', path: `${prefix}/appointments` },
        { icon: Pill, label: 'Prescriptions', path: `${prefix}/prescriptions` },
        { icon: User, label: 'Profile', path: `${prefix}/profile` },
        { icon: Bell, label: 'Notifications', path: `${prefix}/notifications` },
      ];

  return (
    <aside
      className={`hidden lg:flex flex-col bg-white border-r border-[var(--color-border)] transition-all duration-300
                  ${isCollapsed ? 'w-20' : 'w-64'}`}
      style={{ minHeight: 'calc(100vh - 64px)' }}
    >
      {/* Role Badge */}
      <div className="p-4 border-b border-[var(--color-border)]">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                            ${isDoctor ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
              {isDoctor ? <Stethoscope className="w-5 h-5" /> : <Heart className="w-5 h-5" />}
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--color-text)]">{user?.username}</p>
              <p className="text-xs text-[var(--color-text-muted)]">{isDoctor ? 'Clinic Doctor' : 'Patient'}</p>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="flex justify-center">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                            ${isDoctor ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
              {isDoctor ? <Stethoscope className="w-5 h-5" /> : <Heart className="w-5 h-5" />}
            </div>
          </div>
        )}
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-3 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                         transition-all duration-200 group
                ${isActive
                  ? 'bg-[var(--color-primary)] text-white shadow-md'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]'
                }
                ${isCollapsed ? 'justify-center' : ''}`}
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon className={`w-5 h-5 flex-shrink-0
                ${isActive ? 'text-white' : 'text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)]'}`} />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="p-3 border-t border-[var(--color-border)]">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm
                     text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] transition-colors"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          {!isCollapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
