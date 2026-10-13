import React, { useState } from 'react';
import { User, AuthMode, UserRole } from '../types/auth';
import { AuthService } from '../services/authService';
import {
  Lock,
  Mail,
  User as UserIcon,
  Shield,
  Eye,
  EyeOff,
  X,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: User) => void;
  initialMode?: AuthMode;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);

  // Login Form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Sign Up Form
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupRole, setSignupRole] = useState<UserRole>('Staff Member');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');

  // Forgot Password Form
  const [resetEmail, setResetEmail] = useState('');
  const [resetStep, setResetStep] = useState<1 | 2>(1);
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Feedback State
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Clear messages on mode switch
  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setError(null);
    setSuccessMsg(null);
    setResetStep(1);
  };

  // Quick fill demo credentials
  const handleQuickFill = (role: 'admin' | 'staff') => {
    if (role === 'admin') {
      setLoginEmail('admin@college.edu');
      setLoginPassword('admin123');
    } else {
      setLoginEmail('staff@college.edu');
      setLoginPassword('staff123');
    }
    setError(null);
  };

  // Handle Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const res = AuthService.login(loginEmail, loginPassword);
    if (!res.success) {
      setError(res.error || 'Authentication failed');
      return;
    }

    if (res.user) {
      onAuthSuccess(res.user);
      onClose();
    }
  };

  // Handle Signup
  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (signupPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    const res = AuthService.signup(signupName, signupEmail, signupRole, signupPassword);
    if (!res.success) {
      setError(res.error || 'Signup failed');
      return;
    }

    if (res.user) {
      onAuthSuccess(res.user);
      onClose();
    }
  };

  // Handle Forgot Password
  const handleForgotEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!resetEmail.trim()) {
      setError('Please enter your registered college email.');
      return;
    }

    // Move to step 2 (Set new password)
    setResetStep(2);
    setVerificationCode('8492'); // Simulation code
    setSuccessMsg('Verification code sent to your email. You can now set your new password.');
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match.');
      return;
    }

    const res = AuthService.resetPassword(resetEmail, newPassword);
    if (!res.success) {
      setError(res.error || 'Password reset failed');
      return;
    }

    // Automatically log in with new password
    const loginRes = AuthService.login(resetEmail, newPassword);
    if (loginRes.success && loginRes.user) {
      onAuthSuccess(loginRes.user);
      onClose();
    } else {
      setSuccessMsg('Password updated successfully! Please log in with your new password.');
      switchMode('login');
      setLoginEmail(resetEmail);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative overflow-hidden">
        {/* Subtle accent backdrop blur */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold text-base shadow-sm">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                {mode === 'login' && 'Staff & Admin Login'}
                {mode === 'signup' && 'Create Staff Account'}
                {mode === 'forgot_password' && 'Reset Account Password'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {mode === 'login' && 'Sign in to manage predictions & view reports'}
                {mode === 'signup' && 'Register your canteen operations profile'}
                {mode === 'forgot_password' && 'Recover and update your account credentials'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs p-3 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs p-3 rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* 1. LOGIN MODE */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            {/* Quick Demo Fill Buttons */}
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Test Credentials:</span>
              </span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickFill('admin')}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-amber-400 font-semibold"
                >
                  Supervisor
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('staff')}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-sky-400 font-semibold"
                >
                  Kitchen Staff
                </button>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">College Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  placeholder="admin@college.edu"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full h-10 bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-slate-300 font-semibold">Password</label>
                <button
                  type="button"
                  onClick={() => switchMode('forgot_password')}
                  className="text-[11px] text-amber-400 hover:underline font-semibold"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full h-10 bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-10 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-11 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 font-bold text-slate-950 text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center pt-2 border-t border-slate-800 text-slate-400">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => switchMode('signup')}
                className="text-amber-400 font-bold hover:underline ml-1"
              >
                Sign Up
              </button>
            </div>
          </form>
        )}

        {/* 2. SIGN UP MODE */}
        {mode === 'signup' && (
          <form onSubmit={handleSignupSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kulkarni"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  className="w-full h-10 bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">College Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  placeholder="name@college.edu"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  className="w-full h-10 bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Operational Role</label>
              <select
                value={signupRole}
                onChange={(e) => setSignupRole(e.target.value as UserRole)}
                className="w-full h-10 bg-slate-950 border border-slate-700 rounded-xl px-3 text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Staff Member">Staff Member</option>
                <option value="Kitchen Manager">Kitchen Manager</option>
                <option value="Canteen Supervisor">Canteen Supervisor</option>
                <option value="College Administrator">College Administrator</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Password</label>
                <input
                  type="password"
                  placeholder="Min 6 characters"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  className="w-full h-10 bg-slate-950 border border-slate-700 rounded-xl px-3 text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Confirm Password</label>
                <input
                  type="password"
                  placeholder="Repeat password"
                  value={signupConfirmPassword}
                  onChange={(e) => setSignupConfirmPassword(e.target.value)}
                  className="w-full h-10 bg-slate-950 border border-slate-700 rounded-xl px-3 text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-11 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 font-bold text-slate-950 text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>Create Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center pt-2 border-t border-slate-800 text-slate-400">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="text-amber-400 font-bold hover:underline ml-1"
              >
                Sign In
              </button>
            </div>
          </form>
        )}

        {/* 3. FORGOT PASSWORD MODE */}
        {mode === 'forgot_password' && (
          <div className="space-y-4 text-xs">
            {resetStep === 1 ? (
              <form onSubmit={handleForgotEmailSubmit} className="space-y-3.5">
                <p className="text-slate-300 leading-relaxed">
                  Enter the email address associated with your account. We will send you a verification code to reset your password.
                </p>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Registered College Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="email"
                      placeholder="e.g. admin@college.edu"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full h-10 bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full h-11 rounded-xl bg-amber-500 hover:bg-amber-600 font-bold text-slate-950 text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Continue to Reset</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-3.5">
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-400">
                  Resetting credentials for: <b className="text-white">{resetEmail}</b>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    4-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="w-full h-10 bg-slate-950 border border-slate-700 rounded-xl px-3 text-center tracking-widest font-mono text-base font-bold text-amber-400 focus:outline-none focus:border-amber-500"
                    required
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    Simulation code (pre-filled: 8492)
                  </span>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">New Password</label>
                  <input
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full h-10 bg-slate-950 border border-slate-700 rounded-xl px-3 text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="w-full h-10 bg-slate-950 border border-slate-700 rounded-xl px-3 text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 font-bold text-slate-950 text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Update Password & Log In</span>
                </button>
              </form>
            )}

            <div className="text-center pt-2 border-t border-slate-800 text-slate-400">
              Remember your password?{' '}
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="text-amber-400 font-bold hover:underline ml-1"
              >
                Back to Login
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
