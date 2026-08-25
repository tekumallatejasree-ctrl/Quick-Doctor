import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  Shield, Video, FileText, Clock, Users,
  ArrowRight, CheckCircle2, Stethoscope, Smartphone
} from 'lucide-react';

export default function LandingPage() {
  const features = [
    {
      icon: Video,
      title: 'Online Consultations',
      description: 'Connect with doctors via secure Google Meet video calls from anywhere.',
      color: '#2563EB',
      bg: '#eff6ff',
    },
    {
      icon: FileText,
      title: 'Digital Prescriptions',
      description: 'Receive detailed prescriptions with medicines, diet plans, and health tips.',
      color: '#10b981',
      bg: '#ecfdf5',
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your health data is protected with enterprise-grade security and encryption.',
      color: '#8b5cf6',
      bg: '#f5f3ff',
    },
    {
      icon: Clock,
      title: 'Flexible Scheduling',
      description: 'Book morning, afternoon, or evening slots that fit your schedule.',
      color: '#f59e0b',
      bg: '#fffbeb',
    },
  ];

  const steps = [
    { step: '01', title: 'Register', description: 'Create your account with email verification' },
    { step: '02', title: 'Choose Doctor', description: 'Browse qualified doctors by specialization' },
    { step: '03', title: 'Book & Pay', description: 'Select a slot and complete payment' },
    { step: '04', title: 'Consult', description: 'Join the video call and get your prescription' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="gradient-hero relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-20 right-10 w-72 h-72 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full bg-purple-500/5 blur-3xl -translate-x-1/2 -translate-y-1/2" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20
                            rounded-full px-4 py-2 text-sm text-blue-200 mb-8 animate-fade-in">
              <Stethoscope className="w-4 h-4" />
              <span>Trusted by thousands of patients across India</span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6 animate-slide-up">
              Your Health,{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                One Click Away
              </span>
            </h1>

            <p className="text-lg md:text-xl text-blue-200 leading-relaxed mb-10 max-w-2xl animate-slide-up"
               style={{ animationDelay: '0.1s' }}>
              Consult qualified doctors online from the comfort of your home.
              Get prescriptions, health tips, and personalized care — all through a secure platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-[var(--color-primary)]
                           font-semibold rounded-2xl hover:bg-blue-50 transition-all duration-300
                           shadow-xl hover:shadow-2xl active:scale-95 text-lg"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm
                           text-white border border-white/20 font-semibold rounded-2xl
                           hover:bg-white/20 transition-all duration-300 text-lg"
              >
                Login to Dashboard
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 mt-14 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <div>
                <p className="text-3xl font-bold text-white">500+</p>
                <p className="text-sm text-blue-300">Consultations</p>
              </div>
              <div className="w-px bg-white/20" />
              <div>
                <p className="text-3xl font-bold text-white">50+</p>
                <p className="text-sm text-blue-300">Expert Doctors</p>
              </div>
              <div className="w-px bg-white/20" />
              <div>
                <p className="text-3xl font-bold text-white">4.9★</p>
                <p className="text-sm text-blue-300">Patient Rating</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-[var(--color-primary-100)] text-[var(--color-primary)]
                            rounded-full text-sm font-medium mb-4">
              Why DoctorConnect?
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-text)] mb-4">
              Healthcare Made Simple
            </h2>
            <p className="text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto">
              Everything you need for a seamless online consultation experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl border border-[var(--color-border)] hover:border-[var(--color-primary-200)]
                           transition-all duration-300 hover:shadow-lg group cursor-default"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4
                                group-hover:scale-110 transition-transform duration-300"
                     style={{ backgroundColor: feature.bg }}>
                  <feature.icon className="w-6 h-6" style={{ color: feature.color }} />
                </div>
                <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">{feature.title}</h3>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-[var(--color-background)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-emerald-100 text-emerald-600
                            rounded-full text-sm font-medium mb-4">
              How It Works
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-text)] mb-4">
              4 Simple Steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative text-center">
                <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center
                                text-white text-xl font-bold mx-auto mb-4 shadow-lg">
                  {step.step}
                </div>
                <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">{step.title}</h3>
                <p className="text-sm text-[var(--color-text-secondary)]">{step.description}</p>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[calc(50%+40px)] w-[calc(100%-80px)]
                                  h-0.5 bg-[var(--color-border)]" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="gradient-primary rounded-3xl p-12 md:p-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/10 -mr-20 -mt-20" />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/5 -ml-16 -mb-16" />

            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Smartphone className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-lg text-blue-200 mb-8 max-w-xl mx-auto">
                Join DoctorConnect today and experience healthcare like never before.
              </p>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[var(--color-primary)]
                           font-semibold rounded-2xl hover:bg-blue-50 transition-all duration-300
                           shadow-xl active:scale-95 text-lg"
              >
                Create Free Account
                <ArrowRight className="w-5 h-5" />
              </Link>

              <div className="flex items-center justify-center gap-6 mt-8 text-blue-200 text-sm">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Free registration
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> No hidden fees
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" /> Expert doctors
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
