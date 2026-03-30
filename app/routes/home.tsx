import { useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router';
import { Building2, Users, CreditCard, BarChart3, Shield, Zap, CheckCircle, ArrowRight, Star, Phone, Mail, MapPin } from 'lucide-react';
import { useAuthStore } from '~/store/auth.store';

export default function HomePage() {
  const { user, initialize, initialized } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!initialized) return;
    if (user) {
      if (user.role === 'SUPER_ADMIN') navigate('/super-admin');
      else if (user.role === 'ADMIN') navigate('/admin');
      else navigate('/resident');
    }
  }, [user, initialized, navigate]);

  const features = [
    { icon: Building2, title: 'Building Management', desc: 'Manage multiple PG buildings, floors, rooms and seats from one dashboard.' },
    { icon: Users, title: 'Resident Portal', desc: 'Full resident lifecycle from registration to move-out with KYC management.' },
    { icon: CreditCard, title: 'Payment Tracking', desc: 'Automated rent collection, payment history, and outstanding dues management.' },
    { icon: BarChart3, title: 'Financial Reports', desc: 'Income vs expense analysis with visual graphs and monthly summaries.' },
    { icon: Shield, title: 'Role-Based Access', desc: 'Super Admin, PG Admin, and Resident roles with fine-grained permissions.' },
    { icon: Zap, title: 'Smart Reminders', desc: 'Automated SMS, WhatsApp and Email reminders for pending rent payments.' },
  ];

  const stats = [
    { label: 'PG Buildings', value: '500+' },
    { label: 'Active Residents', value: '10,000+' },
    { label: 'Payments Processed', value: '₹50L+' },
    { label: 'Happy Admins', value: '200+' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">Lucky Luxury PG</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-slate-300 hover:text-white text-sm font-medium transition-colors px-4 py-2">
              Login
            </Link>
            <Link to="/register" className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-all shadow-lg shadow-blue-500/25">
              Register Now
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto relative">
          <div className="inline-flex items-center gap-2 bg-blue-600/20 border border-blue-500/30 rounded-full px-4 py-2 text-blue-300 text-sm font-medium mb-8">
            <Star className="w-4 h-4 fill-current" />
            India's #1 PG Management Platform
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
            Manage Your PG<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              Like a Pro
            </span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Complete PG management solution for property owners, managers, and residents. 
            Track payments, manage residents, and grow your PG business effortlessly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-4 rounded-xl transition-all shadow-xl shadow-blue-500/30 text-lg">
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/login" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-8 py-4 rounded-xl transition-all text-lg backdrop-blur-sm">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 border-y border-white/10">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-4xl font-extrabold text-white mb-2">{s.value}</div>
              <div className="text-slate-400 text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything You Need</h2>
            <p className="text-slate-400 text-lg">Powerful tools to manage your PG business end-to-end</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-6 transition-all group cursor-default">
                <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <f.icon className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-12 shadow-2xl shadow-blue-500/30">
          <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-blue-100 text-lg mb-8">Join thousands of PG owners managing smarter.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-8 py-4 rounded-xl hover:bg-blue-50 transition-all">
              Register as Resident
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/login" className="inline-flex items-center gap-2 bg-blue-500/30 border border-white/30 text-white font-semibold px-8 py-4 rounded-xl hover:bg-blue-500/50 transition-all">
              Admin Login
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold">Lucky Luxury PG</span>
          </div>
          <p className="text-slate-500 text-sm">© 2024 Lucky Luxury PG. All rights reserved.</p>
          <div className="flex gap-6 text-slate-400 text-sm">
            <Link to="/login" className="hover:text-white transition-colors">Login</Link>
            <Link to="/register" className="hover:text-white transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
