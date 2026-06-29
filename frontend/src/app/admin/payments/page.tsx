'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { getPaymentMethods, updatePaymentMethod, getFileUrl } from '@/lib/api';
import type { PaymentMethod } from '@/types';
import { HiOutlineQrCode, HiCheck } from 'react-icons/hi2';
import toast from 'react-hot-toast';

export default function AdminPaymentsPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [instructions, setInstructions] = useState('');
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function loadMethods() {
    try {
      const res = await getPaymentMethods();
      setMethods(res.data.paymentMethods || []);
    } catch (err) {
      console.error(err);
      toast.error('To\'lov usullarini yuklab bo\'lmadi');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMethods();
  }, []);

  const handleEditClick = (method: PaymentMethod) => {
    setEditingId(method.id);
    setInstructions(method.instructions || '');
    setQrFile(null);
  };

  const handleSave = async (id: string) => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('instructions', instructions);
      if (qrFile) {
        formData.append('qrImage', qrFile);
      }
      await updatePaymentMethod(id, formData);
      toast.success('To\'lov ma\'lumotlari yangilandi!');
      setEditingId(null);
      loadMethods();
    } catch (err) {
      console.error(err);
      toast.error('Yangilashda xatolik yuz berdi');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-10 h-10 border-2 border-accent-gold border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-accent-gold mb-2">
            To&apos;lov tizimlari sozlamalari
          </h1>
          <p className="text-text-secondary text-sm">
            Foydalanuvchilarga checkout jarayonida ko&apos;rsatiladigan Click va Paynet ma&apos;lumotlari hamda QR kodlarini boshqarish.
          </p>
        </div>

        {/* Methods list */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {methods.map((method) => {
            const isEditing = editingId === method.id;
            const qrImage = method.qrImageUrl ? getFileUrl(method.qrImageUrl!) : null;
            
            return (
              <Card key={method.id} className="bg-bg-secondary/60 border-border-gold/20 p-6 flex flex-col justify-between">
                <div className="space-y-6">
                  {/* Name header */}
                  <div className="border-b border-border-default/30 pb-3">
                    <h3 className="text-xl font-heading font-bold text-accent-gold">{method.name}</h3>
                  </div>

                  {/* QR code display */}
                  <div className="flex flex-col items-center justify-center">
                    {qrImage && !isEditing ? (
                      <div className="bg-white p-3 rounded border border-accent-gold/40 shadow max-w-[160px]">
                        <img src={qrImage} alt="QR Code" className="w-[140px] h-[140px] object-contain" />
                      </div>
                    ) : isEditing ? (
                      <div className="space-y-2 text-center w-full">
                        <label className="block text-xs font-semibold text-text-secondary font-heading mb-1">
                          Yangi QR kod yuklash
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => e.target.files && setQrFile(e.target.files[0])}
                          className="w-full text-xs text-text-secondary file:mr-4 file:py-1.5 file:px-3 file:rounded file:border file:border-border-default file:bg-bg-tertiary file:text-text-secondary file:cursor-pointer"
                        />
                      </div>
                    ) : (
                      <div className="w-[120px] h-[120px] border border-dashed border-border-default rounded flex flex-col items-center justify-center text-text-muted bg-bg-tertiary/50">
                        <HiOutlineQrCode className="w-8 h-8 mb-1" />
                        <span className="text-[10px]">QR Kod yo&apos;q</span>
                      </div>
                    )}
                  </div>

                  {/* Instructions */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-text-muted font-heading">
                      To&apos;lov bo&apos;yicha yo&apos;riqnoma matni:
                    </label>
                    {isEditing ? (
                      <Input
                        textarea
                        rows={4}
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                        placeholder="Ushbu QR kodni skanerlang va summani to'lang..."
                      />
                    ) : (
                      <p className="text-text-secondary text-sm bg-bg-tertiary/30 p-3 border border-border-default/40 rounded leading-relaxed whitespace-pre-line font-mono text-xs">
                        {method.instructions || 'Yo\'riqnoma kiritilmagan.'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 pt-4 border-t border-border-default/20 flex gap-2">
                  {isEditing ? (
                    <>
                      <Button
                        variant="primary"
                        size="sm"
                        isLoading={submitting}
                        onClick={() => handleSave(method.id)}
                        className="flex-grow"
                      >
                        <HiCheck className="w-4 h-4 mr-1.5" />
                        Saqlash
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingId(null)}
                      >
                        Bekor qilish
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full"
                      onClick={() => handleEditClick(method)}
                    >
                      Ma&apos;lumotlarni Tahrirlash
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
}
