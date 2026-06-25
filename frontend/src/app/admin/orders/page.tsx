'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { getAdminOrders, confirmOrder, cancelOrder, setManualKey } from '@/lib/api';
import type { Order } from '@/types';
import { STATUS_LABELS } from '@/types';
import { HiCheck, HiXMark, HiPhoto, HiOutlineLockOpen } from 'react-icons/hi2';
import toast from 'react-hot-toast';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Manual key state
  const [mKey, setMKey] = useState('');
  const [submittingKey, setSubmittingKey] = useState(false);

  async function loadOrders() {
    try {
      const params: Record<string, string> = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      const data = await getAdminOrders(params);
      setOrders(data.data.orders);
    } catch (err) {
      console.error(err);
      toast.error('Buyurtmalarni yuklab bo\'lmadi');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const handleConfirm = async (id: string) => {
    if (!window.confirm('Ushbu buyurtmani tasdiqlaysizmi? (Litsenziya kaliti avtomatik biriktiriladi)')) return;
    try {
      await confirmOrder(id);
      toast.success('Buyurtma tasdiqlandi');
      loadOrders();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Tasdiqlashda xatolik yuz berdi. Balki bo\'sh litsenziya kaliti qolmagandir? Bunday holatda buyurtma ostida qo\'lda key kiritishingiz mumkin.');
    }
  };

  const handleCancel = async (id: string) => {
    if (!window.confirm('Ushbu buyurtmani rad etasizmi?')) return;
    try {
      await cancelOrder(id);
      toast.success('Buyurtma rad etildi (Bekor qilindi)');
      loadOrders();
    } catch (err) {
      console.error(err);
      toast.error('Rad etishda xatolik yuz berdi');
    }
  };

  const handleManualKeySubmit = async (orderId: string) => {
    if (!mKey.trim()) return;
    setSubmittingKey(true);
    try {
      await setManualKey(orderId, mKey);
      toast.success('Litsenziya kaliti qo\'lda biriktirildi va buyurtma tasdiqlandi!');
      setMKey('');
      setExpandedOrderId(null);
      loadOrders();
    } catch (err) {
      console.error(err);
      toast.error('Kalitni biriktirib bo\'lmadi');
    } finally {
      setSubmittingKey(false);
    }
  };

  const formatPrice = (price: number) =>
    price.toLocaleString('uz-UZ').replace(/,/g, ',') + " so'm";

  const getStatusVariant = (status: string) => {
    if (status === 'CONFIRMED') return 'success';
    if (status === 'PENDING') return 'warning';
    return 'error';
  };

  return (
    <AdminLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-accent-gold mb-2">
            Buyurtmalar / To&apos;lovlar boshqaruvi
          </h1>
          <p className="text-text-secondary text-sm">
            Foydalanuvchilar tomondan yuborilgan to&apos;lov cheklarini tekshirish va tasdiqlash paneli.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 border-b border-border-default/40 pb-4">
          {['ALL', 'PENDING', 'CONFIRMED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`text-xs font-semibold px-3 py-1.5 rounded transition-all ${
                statusFilter === st
                  ? 'bg-accent-gold text-bg-primary'
                  : 'bg-bg-secondary text-text-secondary hover:text-text-primary'
              }`}
            >
              {st === 'ALL' ? 'Barchasi' : STATUS_LABELS[st] || st}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse h-20" />
            ))}
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => {
              const isExpanded = expandedOrderId === order.id;
              const hasReceipt = !!order.receiptImageUrl;
              const receiptUrl = hasReceipt ? `http://localhost:5000${order.receiptImageUrl}` : null;
              
              return (
                <Card key={order.id} className="bg-bg-secondary/40 border-border-default/60 p-0 overflow-hidden">
                  {/* Summary Bar */}
                  <div
                    className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-bg-secondary/90 transition-colors"
                    onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                  >
                    <div>
                      <p className="font-semibold text-text-primary text-base">
                        {order.product?.name}
                      </p>
                      <p className="text-xs text-text-muted mt-1 font-mono">
                        Sotib oluvchi: <span className="text-text-secondary font-sans">{order.user?.name} ({order.user?.email})</span> •{' '}
                        {new Date(order.createdAt).toLocaleDateString('uz-UZ')}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 self-start md:self-center">
                      <span className="font-mono text-accent-gold font-bold">
                        {formatPrice(order.amount)}
                      </span>
                      <Badge variant={getStatusVariant(order.status)}>
                        {STATUS_LABELS[order.status]}
                      </Badge>
                      <Badge variant="default" className="font-mono uppercase">
                        {order.paymentType}
                      </Badge>
                    </div>
                  </div>

                  {/* Expanded Detail Box */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-2 border-t border-border-default/30 bg-bg-secondary/20 space-y-6 animate-fade-in">
                      {/* Flex grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left: receipt image screenshot */}
                        <div>
                          <h4 className="text-sm font-semibold font-heading text-accent-gold mb-3 flex items-center gap-1.5">
                            <HiPhoto className="w-4 h-4" /> To&apos;lov cheki rasmi
                          </h4>
                          {receiptUrl ? (
                            <a href={receiptUrl} target="_blank" rel="noreferrer" className="block max-w-[260px] border border-border-gold/30 rounded overflow-hidden shadow-lg hover:opacity-90 transition-opacity">
                              <img src={receiptUrl} alt="Receipt Check" className="w-full object-contain max-h-[300px]" />
                            </a>
                          ) : (
                            <p className="text-xs text-text-muted italic">To&apos;lov cheki rasm formatida yuklanmagan.</p>
                          )}
                        </div>

                        {/* Right: Manual key assignment & information */}
                        <div className="space-y-4">
                          <h4 className="text-sm font-semibold font-heading text-accent-gold flex items-center gap-1.5">
                            <HiOutlineLockOpen className="w-4 h-4" /> Kalit biriktirish (Qo&apos;lda)
                          </h4>
                          <p className="text-xs text-text-secondary">
                            Agar mahsulot uchun tayyor litsenziyalar kaliti tugagan bo&apos;lsa yoki siz har bir xaridorga qo&apos;lda kalit yaratib berishni xohlasangiz, quyidagi maydonga yozing. Bu kalit buyurtmani tasdiqlash bilan bir vaqtda foydalanuvchiga taqdim etiladi.
                          </p>

                          <div className="flex gap-2">
                            <Input
                              placeholder="KEY-ASSIGN-MANUALLY-XXX"
                              value={mKey}
                              onChange={(e) => setMKey(e.target.value)}
                              disabled={submittingKey || order.status !== 'PENDING'}
                              className="flex-grow"
                            />
                            <Button
                              variant="secondary"
                              onClick={() => handleManualKeySubmit(order.id)}
                              isLoading={submittingKey}
                              disabled={!mKey.trim() || order.status !== 'PENDING'}
                            >
                              Biriktirish
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Main action buttons for PENDING orders */}
                      {order.status === 'PENDING' && (
                        <div className="flex items-center gap-3 border-t border-border-default/20 pt-4 mt-4">
                          <Button
                            variant="primary"
                            onClick={() => handleConfirm(order.id)}
                            className="bg-green-600 hover:bg-green-500 border-green-600 hover:border-green-500 text-white"
                          >
                            <HiCheck className="w-5 h-5 mr-1" />
                            To&apos;lovni Tasdiqlash
                          </Button>
                          <Button
                            variant="danger"
                            onClick={() => handleCancel(order.id)}
                          >
                            <HiXMark className="w-5 h-5 mr-1" />
                            Rad etish (Bekor qilish)
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-text-muted">
            Buyurtmalar mavjud emas.
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
