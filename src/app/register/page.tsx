'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { useRouter } from 'next/navigation';
import { UserPlus, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Server-side sign-up: public registrations are always customers.
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password, fullName }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Registration failed.');
        setLoading(false);
        return;
      }
      if (data.needsConfirmation) {
        setNotice('Check your inbox to confirm your email, then sign in.');
        setLoading(false);
        return;
      }
      router.push(data.redirect || '/products');
      router.refresh();
    } catch {
      setError('An error occurred during registration.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      <div className="text-center space-y-3">
        <Logo className="justify-center" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-display text-ink">
            Create Customer Account
          </h1>
          <p className="text-xs text-copy-secondary mt-1">
            Save favorite deals and sync your shopping wishlist
          </p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-surface-border shadow-soft-sm space-y-5">
        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
            {error}
          </div>
        )}
        {notice && (
          <div role="status" className="p-3 rounded-xl bg-brand-50 border border-brand-200 text-brand-800 text-xs">
            {notice}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label htmlFor="name" className="block font-semibold text-copy-primary mb-1">Full Name</label>
            <input
              id="name"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Priyanshu Sharma"
              className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 text-copy-primary"
            />
          </div>

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
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 text-copy-primary"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-sm text-sm"
          >
            <UserPlus className="w-4 h-4" />
            <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
          </button>
        </form>

        <div className="pt-4 border-t border-surface-border/60 text-center text-xs text-copy-secondary">
          <p>
            Already have an account?{' '}
            <Link href="/login" className="text-brand-600 font-semibold hover:underline">
              Sign in
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

