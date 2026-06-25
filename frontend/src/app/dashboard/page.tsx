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
        setOrders(data.data.orders);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const safeOrders = Array.isArray(orders) ? orders : [];

  const totalSpent = safeOrders
    .filter((o) => o?.status === 'CONFIRMED')
    .reduce((acc, curr) => acc + (curr?.amount || 0), 0);

  const formatPrice = (price: number) =>
    price.toLocaleString('uz-UZ').replace(/,/g, ',') + " so'm";

  const getStatusVariant = (status: string) => {
    if (status === 'CONFIRMED') return 'success';
    if (status === 'PENDING') return 'warning';
    return 'error';
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Welcome */}
        <div className="border-b border-border-default/20 pb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2 w-2 rounded-full bg-accent-gold animate-pulse shadow-[0_0_6px_rgba(201,168,76,0.8)]" />
            <span className="text-[10px] font-mono text-accent-gold tracking-widest uppercase">system_online // session_active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-text-primary tracking-tight">
            Xush kelibsiz, <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-gold via-accent-bronze to-accent-gold-light">{user?.name}</span>!
          </h1>
          <p className="text-text-muted text-xs font-mono mt-1">
            &gt; idev-hub_client_shell:~$ fetch_user_dashboard_info --verbose
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card className="relative overflow-hidden bg-bg-secondary/40 border border-border-default/60 hover:border-accent-gold/40 hover:shadow-[0_0_20px_rgba(201,168,76,0.1)] transition-all duration-300">
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-accent-gold/5 to-transparent rounded-bl-full pointer-events-none" />
            <div className="flex items-center gap-4">
              <div className="p-3 rounded bg-accent-gold/10 text-accent-gold border border-accent-gold/20 shadow-[0_0_10px_rgba(201,168,76,0.1)]">
                <HiShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <p className="text-text-muted text-[10px] uppercase tracking-wider font-mono">system.orders.count</p>
                <p className="text-2xl font-bold font-mono mt-0.5 text-text-primary">{safeOrders.length}</p>
              </div>
            </div>
          </Card>

          <Card className="relative overflow-hidden bg-bg-secondary/40 border border-border-default/60 hover:border-green-500/40 hover:shadow-[0_0_20px_rgba(34,197,94,0.1)] transition-all duration-300">
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-green-500/5 to-transparent rounded-bl-full pointer-events-none" />
            <div className="flex items-center gap-4">
              <div className="p-3 rounded bg-green-500/10 text-success border border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.1)]">
                <HiKey className="w-5 h-5" />
              </div>
              <div>
                <p className="text-text-muted text-[10px] uppercase tracking-wider font-mono">active.licenses.total</p>
                <p className="text-2xl font-bold font-mono mt-0.5 text-text-primary">
                  {safeOrders.filter((o) => o?.status === 'CONFIRMED').length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="relative overflow-hidden bg-bg-secondary/40 border border-border-default/60 hover:border-amber-500/40 hover:shadow-[0_0_20px_rgba(245,158,11,0.1)] transition-all duration-300">
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-amber-500/5 to-transparent rounded-bl-full pointer-events-none" />
            <div className="flex items-center gap-4">
              <div className="p-3 rounded bg-amber-500/10 text-warning border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]">
                <HiCreditCard className="w-5 h-5" />
              </div>
              <div>
                <p className="text-text-muted text-[10px] uppercase tracking-wider font-mono">total.transactions.value</p>
                <p className="text-xl font-bold font-mono mt-1 text-accent-gold">
                  {formatPrice(totalSpent)}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Purchases */}
        <Card className="bg-bg-secondary/30 backdrop-blur-sm border border-border-default/60 shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
          <div className="border-b border-border-default/20 pb-4 mb-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-accent-gold animate-pulse shadow-[0_0_5px_rgba(201,168,76,0.8)]" />
              <h3 className="font-heading text-lg font-bold text-accent-gold">So&apos;nggi xaridlar</h3>
            </div>
            <Link href="/dashboard/orders" className="text-xs text-accent-gold hover:text-accent-gold-light hover:underline font-mono">
              [view_all_transactions]
            </Link>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-12 bg-bg-tertiary rounded animate-pulse" />
              ))}
            </div>
          ) : safeOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm font-mono">
                <thead>
                  <tr className="border-b border-border-default/20 text-text-muted text-xs">
                    <th className="pb-3 font-semibold uppercase tracking-wider">Mahsulot</th>
                    <th className="pb-3 font-semibold uppercase tracking-wider">Summa</th>
                    <th className="pb-3 font-semibold uppercase tracking-wider">Holat</th>
                    <th className="pb-3 font-semibold uppercase tracking-wider">Sana</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-default/10 text-xs">
                  {safeOrders.slice(0, 5).map((order) => (
                    <tr key={order.id} className="text-text-secondary hover:bg-bg-tertiary/20 transition-colors">
                      <td className="py-3 font-sans font-medium text-text-primary">{order.product?.name}</td>
                      <td className="py-3 font-mono text-accent-gold">{formatPrice(order.amount)}</td>
                      <td className="py-3">
                        <Badge variant={getStatusVariant(order.status)}>
                          {STATUS_LABELS[order.status]}
                        </Badge>
                      </td>
                      <td className="py-3 text-xs font-mono text-text-muted">
                        {new Date(order.createdAt).toLocaleDateString('uz-UZ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-text-muted font-mono text-xs">
              &gt; STATUS_CODE_404: Hech qanday buyurtmalar topilmadi.{' '}
              <Link href="/catalog" className="text-accent-gold hover:underline">
                [do&apos;konga_o&apos;tish]
              </Link>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
