'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import MatrixRain from '@/components/ui/MatrixRain';
import ParticleNetwork from '@/components/ui/ParticleNetwork';
import { HiCodeBracket } from 'react-icons/hi2';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setError('Barcha maydonlarni to\'ldiring');
      return;
    }

    if (password !== confirmPassword) {
      setError('Parollar mos kelmadi');
      return;
    }

    if (password.length < 8) {
      setError('Parol kamida 8 ta belgidan iborat bo\'lishi kerak');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await register(name, email, password);
      router.push('/dashboard');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Ro\'yxatdan o\'tib bo\'lmadi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-bg-primary flex items-center justify-center p-4 overflow-hidden">
      {/* Matrix rain and node background */}
      <div className="absolute inset-0 opacity-18 pointer-events-none">
        <MatrixRain color="gold" />
      </div>
      <div className="absolute inset-0 opacity-12 pointer-events-none">
        <ParticleNetwork color="gold" />
      </div>

      <Card className="relative z-10 w-full max-w-md bg-bg-secondary/90 border-border-gold/30 p-8 shadow-2xl">
        <div className="flex flex-col items-center mb-6">
          <Link href="/" className="flex items-center gap-2 group mb-4">
            <HiCodeBracket className="w-8 h-8 text-accent-gold" />
            <span className="font-heading text-2xl font-bold tracking-wider text-text-primary">
              iDev-<span className="text-accent-gold">Hub</span>
            </span>
          </Link>
          <h2 className="text-lg font-heading text-text-secondary">Ro&apos;yxatdan o&apos;tish</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Ism"
            type="text"
            placeholder="Dasturchi"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
          />

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

          <Input
            label="Parolni tasdiqlang"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
          />

          {error && <p className="text-error text-sm font-medium">{error}</p>}

          <div className="text-xs text-text-muted space-y-1">
            <p>* Parol kamida 8 ta belgidan iborat bo&apos;lishi kerak</p>
            <p>* Katta, kichik harflar va raqamlarni o&apos;z ichiga olishi kerak</p>
          </div>

          <Button type="submit" className="w-full" isLoading={loading}>
            Ro&apos;yxatdan o&apos;tish
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-text-secondary">
            Hisobingiz bormi?{' '}
            <Link href="/login" className="text-accent-gold hover:underline font-semibold">
              Tizimga kiring
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
