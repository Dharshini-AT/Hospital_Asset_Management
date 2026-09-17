import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Eye, EyeOff, Heart, Loader2, Lock, Mail, Plus, ShieldCheck, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import hero from '../../assets/hero.png';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Demo accounts helper
  const handleSelectRole = (selectedRole) => {
    setRole(selectedRole);
    setError('');
    if (selectedRole === 'ADMIN') {
      setEmail('ADM-001');
      setPassword('Ravi@Bme#7421');
    } else if (selectedRole === 'TECHNICIAN') {
      setEmail('TEC-001');
      setPassword('Arun@Bme#9362');
    } else if (selectedRole === 'STAFF') {
      setEmail('STAFF-001');
      setPassword('Anitha@Icu#5836');
    }
  };

  const handleQuickDemo = (roleType, demoId, demoPass) => {
    setRole(roleType);
    setEmail(demoId);
    setPassword(demoPass);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please provide your Email/User ID and password.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const loggedInUser = await login(email.trim(), password);
      
      const destination =
        loggedInUser.role === 'ADMIN'
          ? '/admin/dashboard'
          : loggedInUser.role === 'TECHNICIAN'
          ? '/technician/dashboard'
          : '/staff/dashboard';

      navigate(destination, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.message ||
        err.message ||
        'Invalid credentials. Please check your email/User ID and password.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#0d2a4a] p-4 sm:p-6 lg:p-8">
      {/* Background Graphic overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#07213d] via-[#0b3866] to-[#0d4f8b] opacity-95" />

      {/* Main Container Card */}
      <div className="relative z-10 grid w-full max-w-[1240px] min-h-[640px] overflow-hidden rounded-3xl bg-white shadow-2xl lg:grid-cols-12">
        
        {/* Left Side: Hospital Branding Panel */}
        <div className="relative hidden lg:col-span-7 lg:flex flex-col justify-between overflow-hidden p-12 text-white">
          {/* Hospital Building Image */}
          <img
            src={hero}
            alt="Hospital Building"
            className="absolute inset-0 h-full w-full object-cover"
          />
          {/* Deep Navy/Cyan Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#022c59]/95 via-[#035399]/85 to-[#0578cc]/70" />

          {/* Content Header */}
          <div className="relative z-10 space-y-8">
            {/* Heart + Plus Logo */}
            <div className="flex items-center gap-3">
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-[#0066ff] shadow-xl">
                <Heart size={36} className="fill-[#0066ff] text-[#0066ff]" />
                <Plus size={20} className="absolute text-white stroke-[3.5]" />
              </div>
            </div>

            {/* Title & Tagline */}
            <div className="space-y-4 max-w-lg">
              <h1 className="text-4xl font-extrabold leading-[1.2] tracking-tight text-white sm:text-5xl">
                Hospital Asset Management & Maintenance Tracking
              </h1>
              <p className="text-lg font-medium text-blue-100/90 tracking-wide">
                Safe Equipment, Better Care.
              </p>
            </div>
          </div>

          {/* Footer Features */}
          <div className="relative z-10 pt-10">
            <div className="flex flex-wrap gap-4 text-xs font-semibold text-blue-100/80">
              <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-md">
                <ShieldCheck size={16} className="text-blue-300" />
                <span>Enterprise Healthcare Grade</span>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-md">
                <UserCheck size={16} className="text-blue-300" />
                <span>Role-Based Workflow Automation</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Login Card */}
        <div className="flex flex-col justify-center px-6 py-10 sm:px-12 lg:col-span-5 bg-white">
          <div className="mx-auto w-full max-w-[420px]">
            {/* Form Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-extrabold tracking-tight text-[#0b2447]">
                Login to Your Account
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Access your dashboard and manage hospital assets
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-700 animate-fade-in flex items-start gap-2">
                <span className="font-bold">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email / User ID */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">
                  Email / User ID
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    placeholder="Enter your email or user ID"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError('');
                    }}
                    placeholder="Enter your password"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 pr-11 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Select Role */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">
                  Select Role
                </label>
                <div className="relative">
                  <select
                    value={role}
                    onChange={(e) => handleSelectRole(e.target.value)}
                    className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-sm text-slate-800 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100 cursor-pointer"
                  >
                    <option value="" disabled>
                      Choose your role
                    </option>
                    <option value="ADMIN">Admin (Administrator)</option>
                    <option value="TECHNICIAN">Biomedical Engineer (Technician)</option>
                    <option value="STAFF">Staff Nurse (Department Staff)</option>
                  </select>
                  <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                    ▼
                  </div>
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="flex h-12 w-full items-center justify-center rounded-xl bg-[#0066ff] text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-600 active:scale-[0.99] disabled:opacity-70 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Login'
                )}
              </button>

              {/* Quick Demo Credentials Switcher */}
              <div className="pt-2">
                <p className="text-center text-[11px] font-semibold text-slate-400 mb-2">
                  Quick Demo Accounts (1-Click Fill)
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('ADMIN', 'ADM-001', 'Ravi@Bme#7421')}
                    className={`rounded-lg border px-2 py-1.5 text-[11px] font-bold transition ${
                      role === 'ADMIN'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('TECHNICIAN', 'TEC-001', 'Arun@Bme#9362')}
                    className={`rounded-lg border px-2 py-1.5 text-[11px] font-bold transition ${
                      role === 'TECHNICIAN'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Technician
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('STAFF', 'STAFF-001', 'Anitha@Icu#5836')}
                    className={`rounded-lg border px-2 py-1.5 text-[11px] font-bold transition ${
                      role === 'STAFF'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Staff
                  </button>
                </div>
              </div>

              {/* Forgot Password */}
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => alert('Please contact the Hospital IT Administrator (ext: 4001) to reset your credentials.')}
                  className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
            </form>

            {/* Bottom Security Badges */}
            <div className="mt-8 flex items-center justify-center gap-2 border-t border-slate-100 pt-6 text-[11px] text-slate-400">
              <span>Secure</span>
              <span>•</span>
              <span>Role Based Access</span>
              <span>•</span>
              <span>JWT Authentication</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
