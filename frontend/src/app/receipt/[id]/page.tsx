'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getPublicReceipt } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { 
  HiShieldCheck, 
  HiCube, 
  HiCalendar, 
  HiUser, 
  HiCreditCard, 
  HiClipboard, 
  HiLockClosed,
  HiOutlineQrCode,
  HiCheck
} from 'react-icons/hi2';
import toast from 'react-hot-toast';

interface PublicOrderDetails {
  id: string;
  amount: number;
  paymentType: string;
  status: string;
  createdAt: string;
  product: {
    name: string;
    category: string;
    price: number;
    description: string;
  };
  user: {
    name: string;
    email: string;
  };
  licenseKey: {
    keyValue: string;
  } | null;
  manualKey: string | null;
}

const CATEGORY_LABELS: Record<string, string> = {
  SERVER_TOOLS: 'Server vositalari',
  AI_BOTS: 'AI/Botlar',
  WEB_DEV: 'Web dasturlash',
  DEVOPS: 'DevOps',
  MOBILE_DEV: 'Mobil dasturlash',
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'To\'lov kutilmoqda',
  CONFIRMED: 'Tasdiqlangan',
  CANCELLED: 'Bekor qilingan',
};

export default function PublicReceiptPage() {
  const params = useParams();
  const id = params?.id as string;
  const [order, setOrder] = useState<PublicOrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    async function fetchReceipt() {
      try {
        const res = await getPublicReceipt(id);
        setOrder(res.data.order);
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.error || 'Buyurtma topilmadi yoki xatolik yuz berdi');
      } finally {
        setLoading(false);
      }
    }

    fetchReceipt();
  }, [id]);

  const handleCopyKey = (keyVal: string) => {
    navigator.clipboard.writeText(keyVal);
    toast.success('Kalit nusxalandi!');
  };

  const getStatusColor = (status: string) => {
    if (status === 'CONFIRMED') return 'text-success border-success/30 bg-green-500/10';
    if (status === 'PENDING') return 'text-warning border-warning/30 bg-amber-500/10';
    return 'text-error border-error/30 bg-red-500/10';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07090e] flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-accent-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#07090e] flex items-center justify-center p-6 text-center">
        <Card className="max-w-md p-8 border-error/20 bg-bg-secondary/40">
          <HiLockClosed className="w-16 h-16 text-error mx-auto mb-4" />
          <h2 className="text-xl font-heading font-bold text-text-primary mb-2">Ruxsatnoma topilmadi</h2>
          <p className="text-sm text-text-muted mb-6">{error || 'Yaroqsiz chek yoki xarid ma\'lumotlari'}</p>
          <a
            href="/"
            className="inline-block text-xs font-semibold text-accent-gold hover:underline"
          >
            ← Bosh sahifaga qaytish
          </a>
        </Card>
      </div>
    );
  }

  const keyVal = order.manualKey || order.licenseKey?.keyValue || '';
  const isConfirmed = order.status === 'CONFIRMED';

  return (
    <div className="min-h-screen bg-[#07090e] flex items-center justify-center p-4 sm:p-6 font-sans antialiased text-text-primary relative overflow-hidden">
      {/* Abstract background neural grid effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(197,160,89,0.08),rgba(255,255,255,0))]" />
      
      <Card className="w-full max-w-2xl bg-bg-secondary/40 border-border-gold/25 backdrop-blur-xl p-6 sm:p-8 rounded-2xl shadow-2xl relative z-10">
        {/* Certificate Glow Effect */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-48 bg-accent-gold/10 rounded-full blur-3xl" />

        {/* Header */}
        <div className="text-center pb-6 border-b border-border-default/10 relative">
          <button
            onClick={() => window.print()}
            className="absolute right-0 top-0 text-[11px] font-semibold text-accent-gold border border-accent-gold/20 hover:border-accent-gold bg-accent-gold/5 px-2.5 py-1 rounded transition-all duration-300 flex items-center gap-1 print:hidden"
          >
            🖨️ Chop etish
          </button>
          <div className="inline-flex items-center gap-1 text-accent-gold font-mono font-bold text-lg tracking-wider mb-2">
            &lt;/&gt; IDEV-HUB
          </div>
          <h1 className="text-xl sm:text-2xl font-heading font-bold tracking-tight text-text-primary">
            Litsenziya &amp; Xarid Ruxsatnomasi
          </h1>
          <p className="text-xs text-text-muted mt-1 font-mono">
            Chek ID: {order.id}
          </p>
        </div>

        {/* Status Shield */}
        <div className="my-6 flex flex-col items-center justify-center text-center p-4 bg-bg-tertiary/20 rounded-xl border border-border-default/10">
          <div className="relative mb-2">
            <HiShieldCheck className={`w-14 h-14 ${isConfirmed ? 'text-success animate-pulse' : 'text-warning'}`} />
            {isConfirmed && (
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
              </span>
            )}
          </div>
          <span className="text-xs font-mono uppercase tracking-wider text-text-muted">Ruxsatnoma Holati</span>
          <span className={`mt-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
            {STATUS_LABELS[order.status]}
          </span>
        </div>

        {/* Body details */}
        <div className="space-y-6">
          {/* Purchased Program Info */}
          <div>
            <h3 className="text-xs font-semibold text-accent-gold uppercase tracking-wider mb-3 flex items-center gap-1.5 font-heading">
              <HiCube className="w-4 h-4" /> Dastur haqida ma&apos;lumot
            </h3>
            <div className="bg-bg-tertiary/40 border border-border-default/10 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-text-muted">Nomi:</span>
                <span className="font-semibold text-text-primary">{order.product.name}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-text-muted">Kategoriya:</span>
                <Badge variant="gold">
                  {CATEGORY_LABELS[order.product.category] || order.product.category}
                </Badge>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-text-muted">Qiymati:</span>
                <span className="font-mono text-accent-gold font-bold">
                  ${order.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* System & Purchase Info */}
          <div>
            <h3 className="text-xs font-semibold text-accent-gold uppercase tracking-wider mb-3 flex items-center gap-1.5 font-heading">
              <HiCalendar className="w-4 h-4" /> Tizim &amp; tranzaksiya tafsilotlari
            </h3>
            <div className="bg-bg-tertiary/40 border border-border-default/10 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[10px] text-text-muted block">XARIDOR</span>
                <span className="text-xs font-semibold block text-text-primary">{order.user.name}</span>
                <span className="text-[10px] text-text-muted block font-mono">{order.user.email}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-text-muted block">SANA</span>
                <span className="text-xs font-semibold block text-text-primary">
                  {new Date(order.createdAt).toLocaleString('uz-UZ')}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-text-muted block">TO&apos;LOV TIZIMI</span>
                <span className="text-xs font-mono font-semibold block text-text-primary">
                  {order.paymentType}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-text-muted block">TIZIM</span>
                <span className="text-xs font-semibold block text-success">
                  iDev-Hub Security Verified
                </span>
              </div>
            </div>
          </div>

          {/* Keys Section */}
          {isConfirmed ? (
            <div>
              <h3 className="text-xs font-semibold text-success uppercase tracking-wider mb-3 flex items-center gap-1.5 font-heading">
                <HiLockClosed className="w-4 h-4" /> Biriktirilgan Litsenziya Kaliti
              </h3>
              {keyVal ? (
                <div className="p-4 bg-green-500/5 border border-success/30 rounded-xl flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] text-success/60 uppercase block font-mono">Faol Kalit</span>
                    <span className="text-sm font-mono text-success font-semibold tracking-wider block truncate select-all">
                      {keyVal}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopyKey(keyVal)}
                    className="inline-flex items-center gap-1.5 text-xs text-success hover:bg-success/15 px-3 py-1.5 rounded-lg border border-success/20 transition-all"
                  >
                    <HiClipboard className="w-4 h-4" /> Nusxa
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-bg-tertiary/40 border border-border-default/10 rounded-xl text-center py-6">
                  <p className="text-xs text-text-muted">
                    Ushbu buyurtmaga hali kalit biriktirilmagan. Iltimos admin bilan bog&apos;laning.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 bg-amber-500/5 border border-warning/30 rounded-xl text-center py-6">
              <p className="text-xs text-warning leading-relaxed">
                ⚠️ To&apos;lovingiz tekshirilmoqda. To&apos;lov chekini platformaga yuklagan bo&apos;lsangiz, admin tez orada tasdiqlaydi va litsenziya kalitingiz bu yerda faollashadi.
              </p>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="mt-8 text-center pt-4 border-t border-border-default/10">
          <p className="text-[10px] text-text-muted">
            iDev-Hub platformasi xavfsizlik va mualliflik huquqini himoya qiladi.
          </p>
          <p className="text-[9px] text-text-muted/60 mt-0.5">
            Verification Engine v1.0.0
          </p>
        </div>
      </Card>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          /* Make Card black-and-white print friendly */
          div[class*="bg-bg-secondary"] {
            background-color: white !important;
            border: 1px solid #ccc !important;
            color: black !important;
            box-shadow: none !important;
            backdrop-filter: none !important;
          }
          span, h1, h2, h3, h4, p, div, td, th {
            color: black !important;
          }
          div[class*="border-border"], div[class*="border-b"], div[class*="divide-y"] {
            border-color: #ddd !important;
          }
          div[class*="bg-bg-tertiary"], div[class*="bg-green-500"], div[class*="bg-amber-500"] {
            background-color: #f9f9f9 !important;
            border: 1px solid #ddd !important;
          }
        }
      `}} />
    </div>
  );
}
