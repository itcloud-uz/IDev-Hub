'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { changePassword } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user } = useAuth();
  
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error('Barcha maydonlarni to\'ldiring');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Yangi parollar mos kelmadi');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Yangi parol kamida 8 ta belgidan iborat bo\'lishi kerak');
      return;
    }

    setLoading(true);
    try {
      await changePassword(oldPassword, newPassword);
      toast.success('Parol muvaffaqiyatli yangilandi!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Parolni yangilab bo\'lmadi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-accent-gold mb-2">
            Mening Profilim
          </h1>
          <p className="text-text-secondary text-sm">
            Profil ma&apos;lumotlari va xavfsizlik sozlamalari.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* User Details Card */}
          <Card className="bg-bg-secondary/40 border-border-default/60">
            <h3 className="font-heading text-lg font-bold text-accent-gold mb-4 border-b border-border-default/30 pb-2">
              Profil Ma&apos;lumotlari
            </h3>
            <div className="space-y-4">
              <div>
                <span className="text-text-muted text-xs uppercase tracking-wider block">Foydalanuvchi ismi</span>
                <span className="text-text-primary text-base font-medium font-mono">{user?.name}</span>
              </div>
              <div>
                <span className="text-text-muted text-xs uppercase tracking-wider block">Elektron pochta</span>
                <span className="text-text-primary text-base font-medium font-mono">{user?.email}</span>
              </div>
              <div>
                <span className="text-text-muted text-xs uppercase tracking-wider block">Tizimga a&apos;zo bo&apos;lgan sana</span>
                <span className="text-text-primary text-sm font-mono">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('uz-UZ', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : ''}
                </span>
              </div>
            </div>
          </Card>

          {/* Change Password Card */}
          <Card className="bg-bg-secondary/40 border-border-default/60">
            <h3 className="font-heading text-lg font-bold text-accent-gold mb-4 border-b border-border-default/30 pb-2">
              Parolni o&apos;zgartirish
            </h3>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <Input
                label="Joriy parol"
                type="password"
                placeholder="••••••••"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                disabled={loading}
              />
              <Input
                label="Yangi parol"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
              />
              <Input
                label="Yangi parolni tasdiqlang"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
              <Button type="submit" className="w-full" isLoading={loading}>
                Parolni yangilash
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
