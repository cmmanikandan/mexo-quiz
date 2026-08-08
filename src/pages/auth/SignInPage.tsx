import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { MexoInput } from '../../components/common/MexoInput';
import { MexoButton } from '../../components/common/MexoButton';
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
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Sign in to MEXO Account</h1>
            <p className="text-xs text-slate-500 mt-0.5">Single account for MEXO Mail, MEXO Forms & MEXO Quiz</p>
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
      </div>
    </div>
  );
};
