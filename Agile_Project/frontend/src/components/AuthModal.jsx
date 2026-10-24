import React, { useState, useEffect } from 'react';
import { X, Mail, KeyRound, Lock, UserCheck, Shield, Sparkles, AlertCircle } from 'lucide-react';
import { api } from '../api/client';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' | 'otp' | 'register'
  const [email, setEmail] = useState('subramnayeswara.23mic7024@vitapstudent.ac.in');
  const [password, setPassword] = useState('student123');
  const [fullName, setFullName] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [rollNumber, setRollNumber] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState(2);
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [devOtpHint, setDevOtpHint] = useState('');
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  if (!isOpen) return null;

  const handleSendOtp = async () => {
    if (!email) {
      setError('Please enter your college email');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await api.sendOtp(email, 'LOGIN');
      setOtpSent(true);
      setDevOtpHint(res.devOtpCode || (email.toLowerCase() === 'subramnayeswara.23mic7024@vitapstudent.ac.in' ? '246810' : ''));
      setTimer(60);
      setSuccessMsg(`Demo OTP: ${res.devOtpCode || (email.toLowerCase() === 'subramnayeswara.23mic7024@vitapstudent.ac.in' ? '246810' : 'Check the backend terminal')}`);
    } catch (err) {
      setError(err.message || 'Failed to send OTP code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode) {
      setError('Please enter the 6-digit OTP code');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const user = await api.verifyOtp(email, otpCode, 'LOGIN');
      onAuthSuccess(user);
      onClose();
    } catch (err) {
      setError(err.message || 'Invalid OTP code');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await api.login(email, password);
      onAuthSuccess(user);
      onClose();
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.register({
        fullName,
        email,
        password,
        department,
        rollNumber,
        yearOfStudy: Number(yearOfStudy),
      });
      setSuccessMsg('Account created successfully! You can now log in.');
      setMode('login');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
    setLoading(true);
    try {
      const user = await api.login(demoEmail, demoPass);
      onAuthSuccess(user);
      onClose();
    } catch (err) {
      setError(err.message || 'Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content p-6 sm:p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3 shadow-inner">
            <UserCheck className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">
            {mode === 'login' ? 'College Portal Sign In' : mode === 'otp' ? 'Login via College Email + OTP' : 'Student Identity Registration'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Access restricted to verified <span className="font-semibold text-blue-600">@vitapstudent.ac.in</span> or <span className="font-semibold text-blue-600">@vitap.ac.in</span> identities.
          </p>
        </div>

        {/* Tabs for switching auth method */}
        <div className="flex rounded-xl bg-slate-100 p-1 mb-5">
          <button
            onClick={() => { setMode('login'); setError(''); }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              mode === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Password Login
          </button>
          <button
            onClick={() => { setMode('otp'); setError(''); if (email.toLowerCase() === 'subramnayeswara.23mic7024@vitapstudent.ac.in') setOtpCode('246810'); }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              mode === 'otp' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Email + OTP
          </button>
          <button
            onClick={() => { setMode('register'); setError(''); }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              mode === 'register' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Register
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
            <span>{successMsg}</span>
            {devOtpHint && (
              <button
                type="button"
                onClick={() => setOtpCode(devOtpHint)}
                className="ml-2 px-2 py-0.5 rounded bg-emerald-200 font-bold hover:bg-emerald-300 text-emerald-900"
              >
                Auto-fill
              </button>
            )}
          </div>
        )}

        {/* Mode 1: Password Login */}
        {mode === 'login' && (
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">College Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="subramnayeswara.23mic7024@vitapstudent.ac.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-2.5 mt-2"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        )}

        {/* Mode 2: OTP Login (PB-01) */}
        {mode === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">College Email</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="student@vitapstudent.ac.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading || timer > 0}
                  className="btn btn-secondary text-xs px-3 py-2 whitespace-nowrap"
                >
                  {timer > 0 ? `Resend (${timer}s)` : 'Send OTP'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">6-Digit Verification Code</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit OTP"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs font-mono tracking-widest text-center border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-2.5 mt-2"
            >
              {loading ? 'Verifying...' : 'Verify OTP & Log In'}
            </button>
          </form>
        )}

        {/* Mode 3: Student Registration (PB-02) */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Legal Name</label>
              <input
                type="text"
                required
                placeholder="Subramanyeswara Rao"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Roll Number</label>
                <input
                  type="text"
                  required
                  placeholder="23MIC7024"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Academic Year</label>
                <select
                  value={yearOfStudy}
                  onChange={(e) => setYearOfStudy(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                >
                  <option value={1}>1st Year (Junior)</option>
                  <option value={2}>2nd Year (Junior)</option>
                  <option value={3}>3rd Year (Senior)</option>
                  <option value={4}>4th Year (Senior)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">College Email (@vitapstudent.ac.in)</label>
              <input
                type="email"
                required
                placeholder="name.roll@vitapstudent.ac.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                required
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-2.5 mt-2"
            >
              {loading ? 'Creating Account...' : 'Complete Registration'}
            </button>
          </form>
        )}

        {/* Demo Fast Login Switcher (Agile Project Testing) */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-3">
            Quick Demo Accounts (Evaluation)
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => quickLogin('student@vitapstudent.ac.in', 'student123')}
              className="p-2 text-center rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-xs"
            >
              <span className="block font-bold text-slate-800">Student</span>
              <span className="text-[10px] text-slate-500">2nd Year</span>
            </button>
            <button
              type="button"
              onClick={() => quickLogin('senior@vitapstudent.ac.in', 'student123')}
              className="p-2 text-center rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all text-xs"
            >
              <span className="block font-bold text-slate-800">Senior</span>
              <span className="text-[10px] text-slate-500">4th Year CSE</span>
            </button>
            <button
              type="button"
              onClick={() => quickLogin('admin@vitap.ac.in', 'admin123')}
              className="p-2 text-center rounded-xl border border-slate-200 hover:border-purple-400 hover:bg-purple-50/50 transition-all text-xs"
            >
              <span className="block font-bold text-slate-800">Librarian</span>
              <span className="text-[10px] text-slate-500">Chief Admin</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
