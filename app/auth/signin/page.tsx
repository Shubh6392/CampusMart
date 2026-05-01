'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import ThemeToggle from '@/components/theme-toggle';

type Tab = 'login' | 'register' | 'admin';

export default function SignInPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [tab, setTab] = useState<Tab>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  useEffect(() => {
    if (status !== 'authenticated') return;
    const isAdmin = (session?.user as any)?.role === 'admin';
    router.replace(isAdmin ? '/dashboard/admin' : '/');
  }, [router, session, status]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const resetMessages = () => { setError(''); setSuccess(''); };

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await signIn('student-credentials', { email: form.email, password: form.password, redirect: false });
    setLoading(false);
    if (res?.error) setError('Invalid email or password. Make sure you use a .edu address.');
    else router.push('/');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    setSuccess('Account created. You can now sign in.');
    setTab('login');
    setForm((f) => ({ ...f, name: '', password: '' }));
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await signIn('admin-credentials', { email: form.email, password: form.password, redirect: false });
    setLoading(false);
    if (res?.error) setError('Invalid admin credentials.');
    else router.push('/dashboard/admin');
  };

  const tabClass = (t: Exclude<Tab, 'admin'>) =>
    `relative z-10 flex-1 rounded-lg px-3 py-2.5 text-sm font-black transition-all duration-200 ease-out ${
      tab === t
        ? 'scale-[1.02] text-white dark:text-slate-950'
        : 'text-slate-600 hover:scale-[1.01] hover:text-slate-950 active:scale-[0.98] dark:text-slate-400 dark:hover:text-white'
    }`;

  const passwordInputType = showPassword ? 'text' : 'password';
  const tabIndicatorStyle = {
    opacity: tab === 'admin' ? 0 : 1,
    transform: tab === 'register' ? 'translateX(calc(100% + 0.5rem))' : 'translateX(0)',
    width: 'calc(50% - 0.25rem)',
  };
  const inputClass = 'w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-950 placeholder:text-slate-400 shadow-sm outline-none transition-all duration-200 focus:border-teal-600 focus:shadow-[0_0_0_3px_rgba(22,160,133,0.20)] dark:border-white/10 dark:bg-white/[0.06] dark:text-white dark:placeholder:text-slate-500 dark:focus:border-teal-300';
  const primaryButtonClass = 'inline-flex w-full items-center justify-center gap-2 rounded-lg bg-teal-600 px-6 py-3 text-sm font-black text-white shadow-[0_12px_30px_rgba(22,160,133,0.22)] transition-all duration-200 ease-out hover:-translate-y-1 hover:bg-teal-500 hover:shadow-[0_10px_20px_rgba(22,160,133,0.30)] active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-teal-500/20 disabled:cursor-not-allowed disabled:translate-y-0 disabled:scale-100 disabled:opacity-70 disabled:shadow-none dark:bg-teal-400 dark:text-slate-950 dark:hover:bg-teal-300';
  const adminButtonClass = 'inline-flex w-full items-center justify-center gap-2 rounded-lg border border-amber-400/70 bg-teal-700 px-6 py-3 text-sm font-black text-white shadow-[0_12px_30px_rgba(15,118,110,0.22)] transition-all duration-200 ease-out hover:-translate-y-1 hover:bg-teal-600 hover:shadow-[0_10px_20px_rgba(15,118,110,0.28)] active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-amber-400/20 disabled:cursor-not-allowed disabled:translate-y-0 disabled:scale-100 disabled:opacity-70 disabled:shadow-none dark:bg-teal-400 dark:text-slate-950 dark:hover:bg-teal-300';

  const PasswordToggle = () => (
    <button
      type="button"
      onClick={() => setShowPassword((value) => !value)}
      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-teal-500/30 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
      aria-label={showPassword ? 'Hide password' : 'Show password'}
    >
      {showPassword ? 'Hide' : 'Show'}
    </button>
  );

  const passwordField = (placeholder: string) => (
    <div className="relative">
      <input
        type={passwordInputType}
        required
        placeholder={placeholder}
        value={form.password}
        onChange={set('password')}
        className={`${inputClass} pr-16`}
      />
      <PasswordToggle />
    </div>
  );

  const LoadingSpinner = () => (
    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
  );

  return (
    <div className="app-shell flex min-h-screen items-center justify-center px-5 py-10">
      <div className="grid w-full max-w-[1100px] gap-6 lg:grid-cols-2 lg:items-center">
        <div className="group relative hidden min-h-[580px] overflow-hidden rounded-xl shadow-[0_24px_70px_rgba(15,23,42,0.18)] lg:block">
          <Image
            src="https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1000&q=80"
            alt="Students working together on campus"
            width={1000}
            height={620}
            className="h-[580px] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.62),rgba(0,0,0,0.18)_48%,transparent)]" />
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-teal-100">CampusMart</p>
            <h2 className="mt-3 max-w-sm text-[28px] font-bold leading-tight">Buy & Sell Within Your Campus</h2>
            <p className="mt-3 text-sm font-semibold text-white/80">Trusted by 1000+ students for safer campus deals.</p>
          </div>
        </div>

        <div className="w-full max-w-lg justify-self-center">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div className="text-left">
              <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-[linear-gradient(135deg,#16a085,#1abc9c)] shadow-[0_14px_30px_rgba(22,160,133,0.30)]">
                <span className="text-2xl font-black text-white">C</span>
              </div>
              <h1 className="mt-4 text-[28px] font-bold leading-tight text-slate-950 dark:text-white">CampusMart</h1>
              <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-400">Secure access for students and admins</p>
            </div>
            <ThemeToggle />
          </div>

          <div className="relative mb-3 flex gap-2 overflow-hidden rounded-xl border border-slate-200 bg-white/70 p-1 shadow-inner backdrop-blur dark:border-white/10 dark:bg-white/[0.05]">
            <div
              className="absolute inset-y-1 left-1 rounded-lg bg-teal-600 shadow-[0_10px_20px_rgba(22,160,133,0.28)] transition-all duration-300 ease-out dark:bg-teal-300"
              style={tabIndicatorStyle}
            />
            <button className={tabClass('login')} onClick={() => { setTab('login'); resetMessages(); }}>Sign In</button>
            <button className={tabClass('register')} onClick={() => { setTab('register'); resetMessages(); }}>Register</button>
          </div>

          <div className="mb-4 text-right">
            <button
              type="button"
              onClick={() => { setTab(tab === 'admin' ? 'login' : 'admin'); resetMessages(); }}
              className="text-xs font-bold text-slate-500 transition hover:text-teal-700 dark:text-slate-400 dark:hover:text-teal-300"
            >
              {tab === 'admin' ? 'Student sign in' : 'Admin access'}
            </button>
          </div>

          <div className="rounded-xl border border-slate-200/90 bg-white/95 p-7 shadow-[0_16px_44px_rgba(15,23,42,0.12)] backdrop-blur-[14px] dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-[0_22px_70px_rgba(20,184,166,0.12)]">
            {error && <div aria-live="polite" className="mb-4 animate-[signin-shake_0.28s_ease-in-out] rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700 shadow-[0_8px_20px_rgba(225,29,72,0.08)] dark:border-rose-300/25 dark:bg-rose-300/10 dark:text-rose-200">{error}</div>}
            {success && <div aria-live="polite" className="mb-4 rounded-lg border border-teal-200 bg-teal-50 p-3 text-sm font-semibold text-teal-800 dark:border-teal-300/25 dark:bg-teal-300/10 dark:text-teal-200">{success}</div>}

            {tab === 'login' && (
              <>
                <button
                  onClick={() => signIn('google', { callbackUrl: '/' })}
                  className="inline-flex w-full items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-950 shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_6px_15px_rgba(15,23,42,0.10)] focus:outline-none focus:ring-4 focus:ring-teal-500/15 dark:border-white/10 dark:bg-white dark:text-slate-950"
                >
                  <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.31 9.14 5.38 12 5.38z" />
                  </svg>
                  Continue with Google (.edu only)
                </button>

                <div className="my-6 flex items-center gap-4">
                  <div className="flex-1 border-t border-slate-200/80 dark:border-white/10" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">or</span>
                  <div className="flex-1 border-t border-slate-200/80 dark:border-white/10" />
                </div>

                <form onSubmit={handleStudentLogin} className="space-y-4">
                  <input type="email" required placeholder="your@university.edu" value={form.email} onChange={set('email')} className={inputClass} />
                  {passwordField('Password')}
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setSuccess('Password reset is not available yet. Please contact your campus admin.')}
                      className="text-xs font-bold text-teal-700 transition hover:text-teal-800 dark:text-teal-300 dark:hover:text-teal-200"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <button type="submit" disabled={loading} className={primaryButtonClass}>
                    {loading && <LoadingSpinner />}
                    {loading ? 'Signing in...' : 'Sign In'}
                  </button>
                </form>
                <p className="mt-4 text-center text-xs font-medium text-slate-600 dark:text-slate-400">
                  No account? <button onClick={() => setTab('register')} className="font-black text-teal-700 dark:text-teal-300">Register here</button>
                </p>
                <div className="mt-4 text-center">
                  <Link href="/" className="text-sm font-bold text-slate-600 transition hover:text-teal-700 dark:text-slate-400 dark:hover:text-teal-300">&larr; Back to Home</Link>
                </div>
              </>
            )}

            {tab === 'register' && (
              <form onSubmit={handleRegister} className="space-y-4">
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Only {process.env.NEXT_PUBLIC_ALLOWED_DOMAIN || '.edu'} email addresses are accepted.</p>
                <input type="text" required placeholder="Full Name" value={form.name} onChange={set('name')} className={inputClass} />
                <input type="email" required placeholder="your@university.edu" value={form.email} onChange={set('email')} className={inputClass} />
                {passwordField('Password (min 6 chars)')}
                <button type="submit" disabled={loading} className={primaryButtonClass}>
                  {loading && <LoadingSpinner />}
                  {loading ? 'Creating account...' : 'Create Account'}
                </button>
                <div className="text-center">
                  <Link href="/" className="text-sm font-bold text-slate-600 transition hover:text-teal-700 dark:text-slate-400 dark:hover:text-teal-300">&larr; Back to Home</Link>
                </div>
              </form>
            )}

            {tab === 'admin' && (
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Admin access only. Not for students.</p>
                <input type="email" required placeholder="admin@campusmart.com" value={form.email} onChange={set('email')} className={inputClass} />
                {passwordField('Password')}
                <button type="submit" disabled={loading} className={adminButtonClass}>
                  {loading && <LoadingSpinner />}
                  {loading ? 'Signing in...' : 'Admin Sign In'}
                </button>
                <div className="text-center">
                  <Link href="/" className="text-sm font-bold text-slate-600 transition hover:text-teal-700 dark:text-slate-400 dark:hover:text-teal-300">&larr; Back to Home</Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
      <style jsx global>{`
        @keyframes signin-shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          50% { transform: translateX(4px); }
          75% { transform: translateX(-2px); }
        }
      `}</style>
    </div>
  );
}
