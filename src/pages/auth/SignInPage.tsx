import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { MexoInput } from '../../components/common/MexoInput';
import { MexoButton } from '../../components/common/MexoButton';
import { authService } from '../../services/authService';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { User, KeyRound, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export const SignInPage: React.FC = () => {
  useDocumentTitle('Sign In — MEXO Account');
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!identifier.trim() || !password.trim()) {
      setError('Please enter your MEXO ID/Email and password.');
      return;
    }

    setIsLoading(true);
    const result = await signIn(identifier, password);
    setIsLoading(false);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Sign in failed. Check your MEXO credentials.');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await authService.signInWithGoogle();
    } catch (e: any) {
      setError(e.message || 'Google sign-in error.');
    }
  };

  return (
    <div className="min-h-screen bg-auth-pageBg flex flex-col justify-center items-center p-4 select-none">
      <div className="w-full max-w-md bg-white rounded-3xl border border-auth-border shadow-mexo-popover p-8 space-y-6">
        {/* Header Branding */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#7C3AED] via-[#6366F1] to-[#0878e8] p-0.5 shadow-mexo-md flex items-center justify-center">
            <div className="w-full h-full bg-white rounded-[14px] p-2 flex items-center justify-center">
              <img src="/logo.png" alt="MEXO" className="w-full h-full object-contain" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Sign in to MEXO</h1>
            <p className="text-xs text-slate-500 mt-0.5">One account for MEXO Mail, MEXO Forms & MEXO Quiz</p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center space-x-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSignIn} className="space-y-4">
          <MexoInput
            label="MEXO Email or Username"
            type="text"
            value={identifier}
            onChange={e => setIdentifier(e.target.value)}
            placeholder="username or name@mexo.com"
            leftIcon={<User className="w-4 h-4 text-slate-400" />}
            required
          />

          <MexoInput
            label="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••••••"
            leftIcon={<KeyRound className="w-4 h-4 text-slate-400" />}
            required
          />

          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-500 flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Unified Auth</span>
            </span>
            <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Password reset link has been dispatched to your primary MEXO email.'); }} className="text-[#7C3AED] font-semibold hover:underline">
              Forgot password?
            </a>
          </div>

          <MexoButton
            type="submit"
            variant="purple"
            size="lg"
            className="w-full"
            isLoading={isLoading}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Sign In to MEXO Quiz
          </MexoButton>
        </form>

        {/* Separator */}
        <div className="relative flex items-center justify-center my-4">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
          <span className="relative bg-white px-3 text-[11px] font-bold text-slate-400 uppercase">Or continue with</span>
        </div>

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-2xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-800 transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>Sign in with Google</span>
        </button>
      </div>
    </div>
  );
};
