'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { getMyOrders, downloadFile } from '@/lib/api';
import type { Order } from '@/types';
import { STATUS_LABELS } from '@/types';
import { HiDownload, HiClipboardDocumentCheck, HiClipboard, HiCube, HiShieldCheck } from 'react-icons/hi2';
import toast from 'react-hot-toast';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  async function loadOrders() {
    try {
      const data = await getMyOrders();
      setOrders(data);
    } catch (err) {
      console.error(err);
      toast.error('Buyurtmalarni yuklab bo\'lmadi');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  const handleDownload = async (orderId: string, filename: string) => {
    setDownloadingId(orderId);
    try {
      const blob = await downloadFile(orderId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || `idev-hub-product-${orderId}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Yuklab olish boshlandi!');
    } catch (err) {
      console.error(err);
      toast.error('Faylni yuklab olishda xatolik. Faqat tasdiqlangan buyurtmalarni yuklab olish mumkin.');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleCopyKey = (keyVal: string) => {
    navigator.clipboard.writeText(keyVal);
    toast.success('Kalit nusxalandi!');
  };

  const getStatusVariant = (status: string) => {
    if (status === 'CONFIRMED') return 'success';
    if (status === 'PENDING') return 'warning';
    return 'error';
  };

  const formatPrice = (price: number) =>
    price.toLocaleString('uz-UZ').replace(/,/g, ',') + " so'm";

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-accent-gold mb-2">
            Mening Buyurtmalarim
          </h1>
          <p className="text-text-secondary text-sm">
            Siz amalga oshirgan barcha buyurtmalar va yuklash havolalari.
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse h-28" />
            ))}
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-6">
            {orders.map((order) => {
              const showLicense = order.status === 'CONFIRMED' && (order.licenseKey?.keyValue || order.manualKey);
              const keyVal = order.licenseKey?.keyValue || order.manualKey || '';
              
              return (
                <Card key={order.id} className="bg-bg-secondary/60 border-border-default/60 p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border-default/20">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-bg-tertiary rounded flex items-center justify-center text-accent-gold border border-border-gold/10">
                        <HiCube className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-text-primary text-base sm:text-lg">
                          {order.product?.name}
                        </h3>
                        <p className="text-xs text-text-muted font-mono mt-0.5">
                          ID: {order.id.substring(0, 8)} •{' '}
                          {new Date(order.createdAt).toLocaleDateString('uz-UZ')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-start md:self-center">
                      <span className="font-mono text-accent-gold font-bold">
                        {formatPrice(order.amount)}
                      </span>
                      <Badge variant={getStatusVariant(order.status)}>
                        {STATUS_LABELS[order.status]}
                      </Badge>
                    </div>
                  </div>

                  {/* License Key Section */}
                  {showLicense && (
                    <div className="mt-4 p-3 bg-bg-tertiary/75 border border-border-default/50 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
                      <div className="flex items-center gap-2">
                        <HiShieldCheck className="w-5 h-5 text-success flex-shrink-0" />
                        <div className="min-w-0">
                          <span className="text-[10px] text-text-muted uppercase block font-medium">Litsenziya kaliti</span>
                          <span className="text-sm font-mono text-success truncate block select-all">
                            {keyVal}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleCopyKey(keyVal)}
                        className="self-end sm:self-center inline-flex items-center gap-1 text-xs text-accent-gold hover:text-accent-gold-light border border-accent-gold/30 hover:border-accent-gold px-2.5 py-1 rounded transition-colors"
                      >
                        <HiClipboard className="w-3.5 h-3.5" />
                        Nusxalash
                      </button>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                    <span className="text-xs text-text-muted">
                      To&apos;lov usuli: <span className="font-mono font-semibold text-text-secondary">{order.paymentType}</span>
                    </span>

                    {order.status === 'CONFIRMED' ? (
                      <Button
                        variant="primary"
                        size="sm"
                        isLoading={downloadingId === order.id}
                        onClick={() => handleDownload(order.id, order.product?.name ? `${order.product.name.replace(/\s+/g, '_').toLowerCase()}.zip` : '')}
                      >
                        <HiDownload className="w-4 h-4 mr-1.5" />
                        Yuklab olish
                      </Button>
                    ) : order.status === 'PENDING' ? (
                      <span className="text-xs text-warning bg-amber-500/10 border border-warning/20 px-3 py-1 rounded">
                        Admin to&apos;lovni tasdiqlashini kutilmoqda.
                      </span>
                    ) : (
                      <span className="text-xs text-error bg-red-500/10 border border-error/20 px-3 py-1 rounded">
                        Buyurtma bekor qilingan.
                      </span>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-bg-secondary/20 border border-border-default/40 rounded-lg">
            <HiCube className="w-16 h-16 text-text-muted mx-auto mb-4" />
            <p className="text-text-secondary text-lg mb-2">Buyurtmalar topilmadi.</p>
            <p className="text-text-muted text-sm mb-4">Siz hali hech narsa sotib olmagansiz.</p>
            <Link href="/catalog" className="text-accent-gold hover:underline font-semibold">
              Xarid qilish →
            </Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
