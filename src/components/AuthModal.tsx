'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

import type { UserRole } from '@/types';

interface AuthModalProps {
  onClose: () => void;
  onLoginSuccess: (email: string, token: string, role: UserRole) => void;
}

export default function AuthModal({ onClose, onLoginSuccess }: AuthModalProps) {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [simulatedOtp, setSimulatedOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const sendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.data?.simulatedOtp || data.simulatedOtp) {
          setSimulatedOtp(data.data?.simulatedOtp || data.simulatedOtp);
        }
        setStep('otp');
      } else {
        setError(data.error || 'Failed to send OTP');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const resData = await res.json();
      
      // Check if token is nested inside resData.data or directly on resData
      const token = resData.token || resData.data?.token;
      const isSuccess = resData.success;
  
      if (isSuccess && token) {
        const userRole: UserRole =
          resData.data?.user?.role || resData.user?.role || 'customer';
        localStorage.setItem('user_email', email);
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_role', userRole);
        setOtp('');
        setSimulatedOtp('');
        onLoginSuccess(email, token, userRole);
        onClose();
      } else {
        // Show the actual error message from the server if available
        setError(resData.error || resData.data?.message || 'Invalid OTP structure');
      }
    } catch {
      setError('Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} size="md">
      <div className="p-8">
        <h2 className="text-2xl font-display font-bold mb-2">
          {step === 'email' ? 'Welcome Back' : 'Enter OTP'}
        </h2>
        <p className="text-sm text-foreground-secondary mb-6">
          {step === 'email'
            ? 'Sign in with your email to track orders and save your wishlist.'
            : `We sent a code to ${email}`}
        </p>

        {simulatedOtp && (
          <div className="mb-4 p-3 bg-accent-light border border-border rounded-sm text-sm">
            Demo OTP: <strong>{simulatedOtp}</strong>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-error/10 border border-error/30 rounded-sm text-sm text-error">
            {error}
          </div>
        )}

        {step === 'email' ? (
          <form onSubmit={sendOtp}>
            <Input
              label="Email Address"
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button type="submit" loading={loading} className="w-full">
              Send OTP
            </Button>
          </form>
        ) : (
          <form onSubmit={verifyOtp}>
            <Input
              label="6-Digit OTP"
              type="text"
              required
              maxLength={6}
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <Button type="submit" loading={loading} className="w-full mb-3">
              Verify & Login
            </Button>
            <Button type="button" variant="ghost" className="w-full" onClick={() => setStep('email')}>
              Change Email
            </Button>
          </form>
        )}
      </div>
    </Modal>
  );
}
