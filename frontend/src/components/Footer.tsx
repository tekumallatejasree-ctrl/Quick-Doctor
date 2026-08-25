import { Heart, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-[#0f172a] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 gradient-primary rounded-xl flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">
                Doctor<span className="text-[var(--color-primary-500)]">Connect</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-md">
              Your trusted telemedicine platform connecting patients with qualified doctors
              for online consultations, prescriptions, and personalized healthcare.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li><Link to="/login" className="text-gray-300 hover:text-white text-sm transition-colors">Login</Link></li>
              <li><Link to="/register" className="text-gray-300 hover:text-white text-sm transition-colors">Register</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
              Contact
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-gray-300 text-sm">
                <Mail className="w-4 h-4 text-[var(--color-primary-500)]" />
                support@doctorconnect.com
              </li>
              <li className="flex items-center gap-2 text-gray-300 text-sm">
                <Phone className="w-4 h-4 text-[var(--color-primary-500)]" />
                +91 98765 43210
              </li>
              <li className="flex items-center gap-2 text-gray-300 text-sm">
                <MapPin className="w-4 h-4 text-[var(--color-primary-500)]" />
                India
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} DoctorConnect. All rights reserved.
          </p>
          <div className="flex gap-6">
            <span className="text-gray-500 text-sm hover:text-gray-300 cursor-pointer transition-colors">Privacy Policy</span>
            <span className="text-gray-500 text-sm hover:text-gray-300 cursor-pointer transition-colors">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
