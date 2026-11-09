import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
      <div className="w-16 h-16 rounded-full bg-brand-50 text-brand-600 mx-auto flex items-center justify-center font-bold text-2xl">
        404
      </div>
      <h1 className="text-2xl font-bold font-display text-copy-primary">
        Page Not Found
      </h1>
      <p className="text-xs text-copy-secondary">
        The deal or product page you were looking for does not exist or may have been updated.
      </p>
      <div className="pt-2">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold px-5 py-2.5 rounded-full transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to SimpleXplore Home</span>
        </Link>
      </div>
    </div>
  );
}

