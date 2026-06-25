'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import MatrixRain from '@/components/ui/MatrixRain';
import { HiCodeBracket } from 'react-icons/hi2';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Barcha maydonlarni to\'ldiring');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Email yoki parol xato');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-bg-primary flex items-center justify-center p-4 overflow-hidden">
      {/* Matrix rain background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <MatrixRain />
      </div>

      <Card className="relative z-10 w-full max-w-md bg-bg-secondary/90 border-border-gold/30 p-8 shadow-2xl">
        <div className="flex flex-col items-center mb-6">
          <Link href="/" className="flex items-center gap-2 group mb-4">
            <HiCodeBracket className="w-8 h-8 text-accent-gold" />
            <span className="font-heading text-2xl font-bold tracking-wider text-text-primary">
              iDev-<span className="text-accent-gold">Hub</span>
            </span>
          </Link>
          <h2 className="text-lg font-heading text-text-secondary">Tizimga kirish</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="example@mail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />

          <Input
            label="Parol"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />

          {error && <p className="text-error text-sm font-medium">{error}</p>}

          <Button type="submit" className="w-full" isLoading={loading}>
            Kirish
          </Button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-text-secondary">
            Hisobingiz yo&apos;qmi?{' '}
            <Link href="/register" className="text-accent-gold hover:underline font-semibold">
              Ro&apos;yxatdan o&apos;ting
            </Link>
          </p>
          <p className="text-xs text-text-muted">
            Parolni unutdingizmi? <span className="text-accent-gold cursor-pointer hover:underline">Qayta tiklash</span>
          </p>
        </div>
      </Card>
    </div>
  );
}
