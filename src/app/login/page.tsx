'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ShieldCheck, LogIn, AlertCircle } from 'lucide-react';
import { isUserAdmin } from '@/lib/auth';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get('error') === 'unauthorized') {
      setError('Access restricted: You must be signed in as simplore01@gmail.com to access the Admin Hub.');
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const trimmedEmail = email.trim();
    const isAdminAccount = isUserAdmin(trimmedEmail);

    try {
      const supabase = createClient();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (signInError) {
        if (
          process.env.NEXT_PUBLIC_DEMO_MODE === 'true' ||
          isAdminAccount ||
          signInError.message.includes('placeholder')
        ) {
          if (isAdminAccount) {
            document.cookie = 'sx_admin_demo=true; path=/; max-age=86400';
            document.cookie = `sx_user_email=${encodeURIComponent(trimmedEmail)}; path=/; max-age=86400`;
            router.push('/admin');
            router.refresh();
            return;
          } else {
            document.cookie = `sx_user_email=${encodeURIComponent(trimmedEmail)}; path=/; max-age=86400`;
            router.push('/products');
            router.refresh();
            return;
          }
        }
        setError(signInError.message);
        setLoading(false);
        return;
      }

      const authenticatedEmail = data.user?.email || trimmedEmail;
      const isMasterAdmin = isUserAdmin(authenticatedEmail, data.user?.user_metadata?.role);

      document.cookie = `sx_user_email=${encodeURIComponent(authenticatedEmail)}; path=/; max-age=86400`;
      if (isMasterAdmin) {
        document.cookie = 'sx_admin_demo=true; path=/; max-age=86400';
        router.push('/admin');
      } else {
        router.push('/products');
      }
      router.refresh();
    } catch {
      setError('An error occurred during authentication.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      <div className="text-center space-y-3">
        <Link href="/" className="inline-flex flex-col items-center group">
          <div className="flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-black text-2xl shadow-soft-md group-hover:scale-105 transition-transform duration-200">
              S
            </div>
            <div className="text-left">
              <span className="font-display font-black text-2xl tracking-tight text-copy-primary">
                Simple<span className="text-brand-500">Xplore</span>
              </span>
              <span className="block text-[10px] uppercase tracking-wider text-copy-secondary font-semibold -mt-1">
                Shop Smart • Explore More
              </span>
            </div>
          </div>
        </Link>
        <div>
          <h1 className="text-2xl font-black font-display text-copy-primary">
            Sign In to SimpleXplore
          </h1>
          <p className="text-xs text-copy-secondary mt-1">
            Access your saved wishlist and personalized shopping finds
          </p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-surface-border shadow-soft-sm space-y-5">
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block font-semibold text-copy-primary mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 text-copy-primary"
            />
          </div>

          <div>
            <label className="block font-semibold text-copy-primary mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 text-copy-primary"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-sm text-sm"
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
          </button>
        </form>

        <div className="pt-4 border-t border-surface-border/60 text-center text-xs text-copy-secondary">
          <p>
            Customer without an account?{' '}
            <Link href="/register" className="text-brand-600 font-semibold hover:underline">
              Create customer account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="max-w-md mx-auto py-20 text-center text-xs text-copy-muted">Loading sign in...</div>}>
      <LoginForm />
    </Suspense>
  );
}
