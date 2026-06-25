'use client';

import { useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiShield } from 'react-icons/fi';
import AuthModal from '@/components/AuthModal';
import Button from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

export default function AdminAuthGate({ children }: { children: ReactNode }) {
  const { isAuthenticated, isAdmin, loading, login, logout, email } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F6F3]">
        <div className="animate-pulse text-foreground-secondary">Loading admin…</div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F6F3] px-4">
        <div className="p-8 bg-background border border-border rounded-xl w-full max-w-md text-center space-y-4 shadow-lg">
          <FiShield className="mx-auto text-accent" size={48} />
          <h1 className="text-2xl font-bold">Admin Access Required</h1>
          <p className="text-sm text-foreground-secondary">
            Sign in with an admin account to access the dashboard.
            {isAuthenticated && !isAdmin && (
              <span className="block mt-2 text-error">Your account ({email}) does not have admin privileges.</span>
            )}
          </p>
          {!isAuthenticated ? (
            <Button onClick={() => setAuthOpen(true)} className="w-full">Sign In as Admin</Button>
          ) : (
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => router.push('/')}>Go Home</Button>
              <Button variant="ghost" className="flex-1" onClick={logout}>Logout</Button>
            </div>
          )}
          <Link href="/" className="text-xs text-foreground-secondary hover:text-accent">← Back to store</Link>
        </div>
        {authOpen && (
          <AuthModal
            onClose={() => setAuthOpen(false)}
            onLoginSuccess={(userEmail, token, role) => {
              login(userEmail, token, role);
              setAuthOpen(false);
            }}
          />
        )}
      </div>
    );
  }

  return <>{children}</>;
}
