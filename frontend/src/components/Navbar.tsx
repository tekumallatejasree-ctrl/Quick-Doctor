import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  Heart, LogIn, UserPlus, LogOut, LayoutDashboard,
  User, Menu, X
} from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getDashboardLink = () => {
    if (user?.role === 'DOCTOR') return '/doctor/dashboard';
    return '/patient/dashboard';
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="glass sticky top-0 z-50 border-b border-[var(--color-border)]"
         style={{ boxShadow: 'var(--shadow-sm)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 gradient-primary rounded-xl flex items-center justify-center
                            group-hover:scale-110 transition-transform duration-300">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-[var(--color-text)]">
              Doctor<span className="text-[var(--color-primary)]">Connect</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                    ${isActive('/login')
                      ? 'bg-[var(--color-primary-100)] text-[var(--color-primary)]'
                      : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]'
                    }`}
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-2 px-4 py-2 gradient-primary text-white rounded-xl text-sm font-medium
                             hover:opacity-90 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <UserPlus className="w-4 h-4" />
                  Register
                </Link>
              </>
            ) : (
              <>
                <Link
                  to={getDashboardLink()}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                    ${location.pathname.includes('dashboard')
                      ? 'bg-[var(--color-primary-100)] text-[var(--color-primary)]'
                      : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]'
                    }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link
                  to={user?.role === 'DOCTOR' ? '/doctor/profile' : '/patient/profile'}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                    ${location.pathname.includes('profile')
                      ? 'bg-[var(--color-primary-100)] text-[var(--color-primary)]'
                      : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]'
                    }`}
                >
                  <User className="w-4 h-4" />
                  Profile
                </Link>
                <div className="w-px h-6 bg-[var(--color-border)] mx-2" />
                <span className="text-sm text-[var(--color-text-muted)] px-2">
                  {user?.username}
                </span>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                             text-[var(--color-error)] hover:bg-red-50 transition-all duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl hover:bg-[var(--color-surface-hover)] transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-[var(--color-border)] mt-2 pt-4 animate-fade-in">
            <div className="flex flex-col gap-2">
              {!isAuthenticated ? (
                <>
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium
                                   text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]">
                    <LogIn className="w-4 h-4" /> Login
                  </Link>
                  <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 gradient-primary text-white rounded-xl text-sm font-medium">
                    <UserPlus className="w-4 h-4" /> Register
                  </Link>
                </>
              ) : (
                <>
                  <Link to={getDashboardLink()} onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium
                                   text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]">
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </Link>
                  <Link to={user?.role === 'DOCTOR' ? '/doctor/profile' : '/patient/profile'}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium
                                   text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]">
                    <User className="w-4 h-4" /> Profile
                  </Link>
                  <button onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                          className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium
                                     text-[var(--color-error)] hover:bg-red-50 text-left">
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
