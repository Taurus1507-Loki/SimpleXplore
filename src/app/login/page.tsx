'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { useRouter, useSearchParams } from 'next/navigation';
import { LogIn, AlertCircle } from 'lucide-react';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get('error') === 'unauthorized') {
      setError('Access restricted: You must be signed in as an administrator to access the Admin Hub.');
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Credentials are verified on the server; admin status is decided there
      // and stored in a signed httpOnly cookie the browser cannot forge.
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password,
          redirect: searchParams.get('redirect') || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Sign in failed.');
        setLoading(false);
        return;
      }
      router.push(data.redirect || '/products');
      router.refresh();
    } catch {
      setError('An error occurred during authentication.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      <div className="text-center space-y-3">
        <Logo className="justify-center" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-display text-ink">
            Sign In to SimpleXplore
          </h1>
          <p className="text-xs text-copy-secondary mt-1">
            Access your saved wishlist and personalized shopping finds
          </p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-surface-border shadow-soft-sm space-y-5">
        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label htmlFor="email" className="block font-semibold text-copy-primary mb-1">Email Address</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 text-copy-primary"
            />
          </div>

          <div>
            <label htmlFor="password" className="block font-semibold text-copy-primary mb-1">Password</label>
            <input
              id="password"
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

      <div className="text-center">
        <Link
          href="/"
          className="text-xs font-semibold text-copy-secondary hover:text-brand-600 transition-colors inline-flex items-center gap-1"
        >
          <span>← Back to Storefront</span>
        </Link>
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
