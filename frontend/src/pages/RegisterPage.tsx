import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '@/services/authService';
import { Heart, UserPlus, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: '', username: '', email: '', mobile: '', password: '', confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const passwordChecks = [
    { label: 'At least 6 characters', valid: form.password.length >= 6 },
    { label: 'Passwords match', valid: form.password === form.confirmPassword && form.confirmPassword.length > 0 },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await authService.register(form);
      navigate('/verify-otp', { state: { email: form.email } });
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string; data?: Record<string, string> } } };
        const data = axiosErr.response?.data;
        if (data?.data) {
          // Validation errors
          const messages = Object.values(data.data).join('. ');
          setError(messages);
        } else {
          setError(data?.message || 'Registration failed. Please try again.');
        }
      } else {
        setError('Network error. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="w-full max-w-lg relative z-10 animate-slide-up">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-lg">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-white">
            Doctor<span className="text-blue-300">Connect</span>
          </span>
        </Link>

        <div className="bg-white rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-[var(--color-text)]">Create Account</h1>
            <p className="text-[var(--color-text-muted)] mt-1">Register as a patient</p>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 mb-6 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-[var(--color-text)] mb-1.5">Full Name</label>
              <input id="fullName" type="text" value={form.fullName} onChange={(e) => updateField('fullName', e.target.value)}
                     placeholder="Enter your full name" required
                     className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]
                                text-[var(--color-text)] placeholder-[var(--color-text-muted)]
                                focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-[var(--color-text)] mb-1.5">Username</label>
                <input id="username" type="text" value={form.username} onChange={(e) => updateField('username', e.target.value)}
                       placeholder="Choose a username" required
                       className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]
                                  text-[var(--color-text)] placeholder-[var(--color-text-muted)]
                                  focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all" />
              </div>
              <div>
                <label htmlFor="mobile" className="block text-sm font-medium text-[var(--color-text)] mb-1.5">Mobile Number</label>
                <input id="mobile" type="tel" value={form.mobile} onChange={(e) => updateField('mobile', e.target.value)}
                       placeholder="10-digit number" required maxLength={10}
                       className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]
                                  text-[var(--color-text)] placeholder-[var(--color-text-muted)]
                                  focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all" />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[var(--color-text)] mb-1.5">Email Address</label>
              <input id="email" type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)}
                     placeholder="Enter your email" required
                     className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]
                                text-[var(--color-text)] placeholder-[var(--color-text-muted)]
                                focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[var(--color-text)] mb-1.5">Password</label>
                <div className="relative">
                  <input id="password" type={showPassword ? 'text' : 'password'} value={form.password}
                         onChange={(e) => updateField('password', e.target.value)}
                         placeholder="Min 6 characters" required
                         className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]
                                    text-[var(--color-text)] placeholder-[var(--color-text-muted)]
                                    focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all pr-10" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] p-1">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-[var(--color-text)] mb-1.5">Confirm Password</label>
                <input id="confirmPassword" type="password" value={form.confirmPassword}
                       onChange={(e) => updateField('confirmPassword', e.target.value)}
                       placeholder="Re-enter password" required
                       className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]
                                  text-[var(--color-text)] placeholder-[var(--color-text-muted)]
                                  focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all" />
              </div>
            </div>

            {/* Password checks */}
            {form.password.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {passwordChecks.map((check, i) => (
                  <div key={i} className={`flex items-center gap-1.5 text-xs ${check.valid ? 'text-[var(--color-success)]' : 'text-[var(--color-text-muted)]'}`}>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {check.label}
                  </div>
                ))}
              </div>
            )}

            <button type="submit" disabled={isLoading}
                    className="w-full py-3 gradient-primary text-white font-semibold rounded-xl
                               hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl
                               active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed
                               flex items-center justify-center gap-2 mt-2">
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <><UserPlus className="w-5 h-5" /> Create Account</>
              )}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-[var(--color-text-muted)]">
            Already have an account?{' '}
            <Link to="/login" className="text-[var(--color-primary)] font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
