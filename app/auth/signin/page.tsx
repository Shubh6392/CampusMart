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

  const tabClass = (t: Tab) =>
    `flex-1 rounded-lg px-3 py-2.5 text-sm font-black transition-all ${
      tab === t
        ? 'bg-teal-700 text-white shadow-sm dark:bg-teal-300 dark:text-slate-950'
        : 'text-slate-500 hover:bg-white hover:text-slate-950 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white'
    }`;

  return (
    <div className="app-shell flex min-h-screen items-center justify-center px-5 py-12">
      <div className="absolute right-4 top-4"><ThemeToggle /></div>
      <div className="grid w-full max-w-6xl gap-6 lg:grid-cols-[1fr_1fr] lg:items-center xl:max-w-7xl">
        <div className="hidden overflow-hidden rounded-lg lg:block">
          <Image
            src="https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1000&q=80"
            alt="Students working together on campus"
            width={1000}
            height={620}
            className="h-[620px] w-full object-cover"
          />
        </div>

        <div className="w-full max-w-md justify-self-center">
          <div className="mb-7 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-teal-700 shadow-lg shadow-teal-700/20 dark:bg-teal-300">
              <span className="text-2xl font-black text-white dark:text-slate-950">C</span>
            </div>
            <h1 className="mt-4 text-3xl font-black text-slate-950 dark:text-white">CampusMart</h1>
            <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">Secure access for students and admins</p>
          </div>

          <div className="mb-4 flex gap-1 rounded-lg border border-slate-200 bg-slate-100 p-1 dark:border-white/10 dark:bg-white/5">
            <button className={tabClass('login')} onClick={() => { setTab('login'); resetMessages(); }}>Sign In</button>
            <button className={tabClass('register')} onClick={() => { setTab('register'); resetMessages(); }}>Register</button>
            <button className={tabClass('admin')} onClick={() => { setTab('admin'); resetMessages(); }}>Admin</button>
          </div>

          <div className="surface-panel p-6">
            {error && <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700 dark:border-rose-300/25 dark:bg-rose-300/10 dark:text-rose-200">{error}</div>}
            {success && <div className="mb-4 rounded-lg border border-teal-200 bg-teal-50 p-3 text-sm font-semibold text-teal-800 dark:border-teal-300/25 dark:bg-teal-300/10 dark:text-teal-200">{success}</div>}

            {tab === 'login' && (
              <>
                <button onClick={() => signIn('google', { callbackUrl: '/' })} className="btn-secondary w-full">
                  Continue with Google (.edu only)
                </button>

                <div className="my-5 flex items-center gap-3">
                  <div className="flex-1 border-t border-slate-200 dark:border-white/10" />
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400">or</span>
                  <div className="flex-1 border-t border-slate-200 dark:border-white/10" />
                </div>

                <form onSubmit={handleStudentLogin} className="space-y-3">
                  <input type="email" required placeholder="your@university.edu" value={form.email} onChange={set('email')} className="field-control" />
                  <input type="password" required placeholder="Password" value={form.password} onChange={set('password')} className="field-control" />
                  <button type="submit" disabled={loading} className="btn-primary w-full">
                    {loading ? 'Signing in...' : 'Sign In'}
                  </button>
                </form>
                <p className="mt-4 text-center text-xs font-medium text-slate-500 dark:text-slate-400">
                  No account? <button onClick={() => setTab('register')} className="font-black text-teal-700 dark:text-teal-300">Register here</button>
                </p>
              </>
            )}

            {tab === 'register' && (
              <form onSubmit={handleRegister} className="space-y-3">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Only {process.env.NEXT_PUBLIC_ALLOWED_DOMAIN || '.edu'} email addresses are accepted.</p>
                <input type="text" required placeholder="Full Name" value={form.name} onChange={set('name')} className="field-control" />
                <input type="email" required placeholder="your@university.edu" value={form.email} onChange={set('email')} className="field-control" />
                <input type="password" required placeholder="Password (min 6 chars)" value={form.password} onChange={set('password')} className="field-control" />
                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? 'Creating account...' : 'Create Account'}
                </button>
              </form>
            )}

            {tab === 'admin' && (
              <form onSubmit={handleAdminLogin} className="space-y-3">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Admin access only. Not for students.</p>
                <input type="email" required placeholder="admin@campusmart.com" value={form.email} onChange={set('email')} className="field-control" />
                <input type="password" required placeholder="Password" value={form.password} onChange={set('password')} className="field-control" />
                <button type="submit" disabled={loading} className="w-full rounded-lg bg-amber-600 px-6 py-3 text-sm font-black text-white transition hover:bg-amber-700 disabled:opacity-60">
                  {loading ? 'Signing in...' : 'Admin Sign In'}
                </button>
              </form>
            )}
          </div>

          <div className="mt-5 text-center">
            <Link href="/" className="text-sm font-bold text-slate-500 transition hover:text-teal-700 dark:text-slate-400 dark:hover:text-teal-300">Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
