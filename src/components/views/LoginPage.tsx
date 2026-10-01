import React, { useState } from 'react';
import {
  HardDrive,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Loader2,
  CheckCircle2,
  KeyRound,
  UserCheck,
} from 'lucide-react';
import { loginWithEmail, requestPasswordReset } from '../../services/authService';
import { ALLOWED_USERS } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';

interface LoginPageProps {
  onBackToLanding?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onBackToLanding }) => {
  const { refreshProfile, unauthorizedAttempt, clearUnauthorizedAttempt } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);

  // Quick fill helper for the two allowed administrators
  const handleQuickFill = (admin: (typeof ALLOWED_USERS)[0]) => {
    setEmail(admin.email);
    setPassword(admin.defaultPasswordHint || 'Aether@Admin2026');
    setErrorMsg(null);
    clearUnauthorizedAttempt();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    setErrorMsg(null);
    clearUnauthorizedAttempt();

    try {
      await loginWithEmail(email, password, rememberMe);
      await refreshProfile();
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;

    setIsSendingReset(true);
    setForgotError(null);

    try {
      await requestPasswordReset(forgotEmail);
      setForgotSuccess(true);
    } catch (err: any) {
      setForgotError(err.message || 'Failed to dispatch password reset instructions.');
    } finally {
      setIsSendingReset(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090B] flex flex-col justify-between p-6 relative overflow-hidden">
      {/* Subtle radial ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 blur-[140px] rounded-full pointer-events-none" />

      {/* Top navbar */}
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between z-10">
        <button
          onClick={onBackToLanding}
          className="flex items-center gap-2.5 text-slate-300 hover:text-white transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center p-0.5 shadow">
            <HardDrive className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-sm tracking-tight text-white">AetherDrive</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
          <ShieldCheck className="w-4 h-4 text-green-500" />
          <span>Strict Allowlist Verification</span>
        </div>
      </div>

      {/* Login Card Container */}
      <div className="max-w-md w-full mx-auto my-8 relative z-10">
        <div className="bg-[#0C0C0E] border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/15 border border-blue-500/30 text-blue-400 flex items-center justify-center mx-auto shadow-inner">
              <HardDrive className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Welcome back</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Sign in to your private AetherDrive workspace
              </p>
            </div>
          </div>

          {/* Unauthorized attempt / Error alert */}
          {(errorMsg || unauthorizedAttempt) && (
            <div className="p-3.5 bg-red-500/15 border border-red-500/30 rounded-2xl text-red-300 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold">Authentication Blocked</strong>
                <span>
                  {errorMsg ||
                    'Access denied. This account is not authorized to use AetherDrive.'}
                </span>
              </div>
            </div>
          )}

          {/* Quick Fill Allowed Accounts Pill Selectors */}
          <div className="space-y-2">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-center">
              Select Authorized Administrator
            </div>
            <div className="grid grid-cols-2 gap-2">
              {ALLOWED_USERS.map((adm) => (
                <button
                  key={adm.email}
                  type="button"
                  onClick={() => handleQuickFill(adm)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    email.toLowerCase() === adm.email.toLowerCase()
                      ? 'border-blue-500 bg-blue-500/15 shadow-sm'
                      : 'border-slate-800 bg-slate-900 hover:border-slate-700 hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                      {adm.initials}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">{adm.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{adm.role}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrorMsg(null);
                  }}
                  placeholder="name@company.com"
                  className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(email);
                    setShowForgotModal(true);
                  }}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMsg(null);
                  }}
                  placeholder="••••••••"
                  className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none transition-colors font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1.5 text-slate-400 hover:text-slate-200 absolute right-2.5"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs text-slate-400">Remember this device for 30 days</span>
              </label>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs uppercase tracking-wider transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <KeyRound className="w-4 h-4" />
              )}
              SIGN IN TO WORKSPACE
            </button>
          </form>

          {/* Access Policy Note */}
          <div className="pt-2 border-t border-slate-800 text-center">
            <p className="text-[11px] text-slate-500">
              Only pre-authorized administrative accounts can access AetherDrive. Public registration and guest access are strictly disabled.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto w-full text-center text-xs text-slate-600 flex items-center justify-center gap-6 z-10">
        <a href="#" className="hover:text-slate-400 transition-colors">
          Privacy Policy
        </a>
        <span>•</span>
        <a href="#" className="hover:text-slate-400 transition-colors">
          Terms of Service
        </a>
      </footer>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[#0C0C0E] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-200">
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">Reset Password</h3>
                  <p className="text-xs text-slate-400">
                    Send secure password reset instructions to your email
                  </p>
                </div>
              </div>

              {forgotError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
                  {forgotError}
                </div>
              )}

              {forgotSuccess ? (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-300 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Password Reset Link Dispatched</span>
                  </div>
                  <p className="text-slate-300">
                    If this address is one of the authorized accounts, a password reset link has been dispatched to <strong className="text-white">{forgotEmail}</strong>.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Authorized Email
                    </label>
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="kcabishiekkumar@gmail.com"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotModal(false);
                        setForgotSuccess(false);
                        setForgotError(null);
                      }}
                      className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSendingReset || !forgotEmail}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 disabled:opacity-50"
                    >
                      {isSendingReset ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                      Send Instructions
                    </button>
                  </div>
                </form>
              )}

              {forgotSuccess && (
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => {
                      setShowForgotModal(false);
                      setForgotSuccess(false);
                      setForgotError(null);
                    }}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
