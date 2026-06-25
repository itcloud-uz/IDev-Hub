'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { getMyOrders } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import type { Order } from '@/types';
import { STATUS_LABELS } from '@/types';
import { HiShoppingCart, HiKey, HiCreditCard, HiHeart } from 'react-icons/hi2';

export default function DashboardPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const data = await getMyOrders();
        setOrders(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const totalSpent = orders
    .filter((o) => o.status === 'CONFIRMED')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const formatPrice = (price: number) =>
    price.toLocaleString('uz-UZ').replace(/,/g, ',') + " so'm";

  const getStatusVariant = (status: string) => {
    if (status === 'CONFIRMED') return 'success';
    if (status === 'PENDING') return 'warning';
    return 'error';
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-accent-gold mb-2">
            Xush kelibsiz, {user?.name}!
          </h1>
          <p className="text-text-secondary text-sm">
            Tizimda sizning profilingiz faol holatda. Quyida xaridlar tarixi va umumiy hisobot.
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card className="flex items-center gap-4 py-6 bg-bg-secondary/60">
            <div className="p-3 rounded-lg bg-accent-gold/10 text-accent-gold">
              <HiShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <p className="text-text-muted text-xs uppercase tracking-wider">Buyurtmalarim</p>
              <p className="text-2xl font-bold font-mono mt-0.5">{orders.length}</p>
            </div>
          </Card>

          <Card className="flex items-center gap-4 py-6 bg-bg-secondary/60">
            <div className="p-3 rounded-lg bg-green-500/10 text-success">
              <HiKey className="w-6 h-6" />
            </div>
            <div>
              <p className="text-text-muted text-xs uppercase tracking-wider">Litsenziyalar</p>
              <p className="text-2xl font-bold font-mono mt-0.5">
                {orders.filter((o) => o.status === 'CONFIRMED').length}
              </p>
            </div>
          </Card>

          <Card className="flex items-center gap-4 py-6 bg-bg-secondary/60">
            <div className="p-3 rounded-lg bg-amber-500/10 text-warning">
              <HiCreditCard className="w-6 h-6" />
            </div>
            <div>
              <p className="text-text-muted text-xs uppercase tracking-wider">Xaridlar hajmi</p>
              <p className="text-xl font-bold font-mono mt-1 text-accent-gold">
                {formatPrice(totalSpent)}
              </p>
            </div>
          </Card>
        </div>

        {/* Recent Purchases */}
        <Card className="bg-bg-secondary/40 border-border-default/60">
          <div className="border-b border-border-default/45 pb-4 mb-4 flex justify-between items-center">
            <h3 className="font-heading text-lg font-bold text-accent-gold">So&apos;nggi xaridlar</h3>
            <Link href="/dashboard/orders" className="text-xs text-accent-gold hover:underline">
              Barchasini ko&apos;rish
            </Link>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-12 bg-bg-tertiary rounded animate-pulse" />
              ))}
            </div>
          ) : orders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border-default/30 text-text-muted">
                    <th className="pb-3 font-semibold">Mahsulot</th>
                    <th className="pb-3 font-semibold">Summa</th>
                    <th className="pb-3 font-semibold">Holat</th>
                    <th className="pb-3 font-semibold">Sana</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-default/20">
                  {orders.slice(0, 5).map((order) => (
                    <tr key={order.id} className="text-text-secondary">
                      <td className="py-3 font-medium text-text-primary">{order.product?.name}</td>
                      <td className="py-3 font-mono text-accent-gold">{formatPrice(order.amount)}</td>
                      <td className="py-3">
                        <Badge variant={getStatusVariant(order.status)}>
                          {STATUS_LABELS[order.status]}
                        </Badge>
                      </td>
                      <td className="py-3 text-xs font-mono">
                        {new Date(order.createdAt).toLocaleDateString('uz-UZ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-text-muted">
              Hech qanday buyurtmalar mavjud emas.{' '}
              <Link href="/catalog" className="text-accent-gold hover:underline">
                Do&apos;konga o&apos;ting
              </Link>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
