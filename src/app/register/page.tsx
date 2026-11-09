'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { UserPlus, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      // Public registrations are strictly customers. Admin role is never assignable from public form.
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: 'customer', // Enforced
          },
        },
      });

      if (signUpError) {
        if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || signUpError.message.includes('placeholder')) {
          document.cookie = `sx_user_email=${encodeURIComponent(email.trim())}; path=/; max-age=86400`;
          router.push('/products');
          router.refresh();
          return;
        }
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      document.cookie = `sx_user_email=${encodeURIComponent(email.trim())}; path=/; max-age=86400`;
      router.push('/products');
      router.refresh();
    } catch {
      setError('An error occurred during registration.');
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
            Create Customer Account
          </h1>
          <p className="text-xs text-copy-secondary mt-1">
            Save favorite deals and sync your shopping wishlist
          </p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-surface-border shadow-soft-sm space-y-5">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block font-semibold text-copy-primary mb-1">Full Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Priyanshu Sharma"
              className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 text-copy-primary"
            />
          </div>

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
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
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
    </div>
  );
}

