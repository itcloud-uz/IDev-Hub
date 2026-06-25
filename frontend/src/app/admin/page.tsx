'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { getAdminStats, getAdminRevenue, getAdminOrders } from '@/lib/api';
import type { AdminStats, RevenueData, Order } from '@/types';
import { STATUS_LABELS } from '@/types';
import { HiUsers, HiShoppingCart, HiCurrencyDollar, HiBriefcase } from 'react-icons/hi2';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [statsRes, revRes, ordersRes] = await Promise.all([
          getAdminStats(),
          getAdminRevenue(),
          getAdminOrders({ limit: '5' })
        ]);
        setStats(statsRes.data);
        setRevenueData(revRes.data.revenue || []);
        setRecentOrders(ordersRes.data.orders || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const formatPrice = (price: number) =>
    price.toLocaleString('uz-UZ').replace(/,/g, ',') + " so'm";

  const getStatusVariant = (status: string) => {
    if (status === 'CONFIRMED') return 'success';
    if (status === 'PENDING') return 'warning';
    return 'error';
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
        <div className="border-b border-red-500/20 pb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_6px_rgba(239,68,68,0.8)]" />
            <span className="text-[10px] font-mono text-error tracking-widest uppercase">root_authority // portal_control</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-amber-500 to-red-400 tracking-tight">
            Admin Panel Dashboard
          </h1>
          <p className="text-text-muted text-xs font-mono mt-1">
            &gt; idev-hub_admin_console:~$ fetch_admin_metrics --extended
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card hoverGlow={false} className="relative overflow-hidden bg-bg-secondary/40 border border-border-default/60 hover:border-red-500/30 hover:shadow-[0_0_20px_rgba(239,68,68,0.08)] transition-all duration-300 flex items-center gap-4 py-5">
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-red-500/5 to-transparent rounded-bl-full pointer-events-none" />
            <div className="p-2.5 rounded bg-red-500/10 text-error border border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.08)]">
              <HiUsers className="w-5 h-5" />
            </div>
            <div>
              <p className="text-text-muted text-[9px] font-mono uppercase tracking-wider">db.users.total</p>
              <p className="text-xl font-bold font-mono mt-0.5 text-text-primary">{stats?.totalUsers || 0}</p>
            </div>
          </Card>

          <Card hoverGlow={false} className="relative overflow-hidden bg-bg-secondary/40 border border-border-default/60 hover:border-amber-500/30 hover:shadow-[0_0_20px_rgba(245,158,11,0.08)] transition-all duration-300 flex items-center gap-4 py-5">
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-amber-500/5 to-transparent rounded-bl-full pointer-events-none" />
            <div className="p-2.5 rounded bg-amber-500/10 text-warning border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.08)]">
              <HiShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <p className="text-text-muted text-[9px] font-mono uppercase tracking-wider">db.orders.total</p>
              <p className="text-xl font-bold font-mono mt-0.5 text-text-primary">{stats?.totalOrders || 0}</p>
            </div>
          </Card>

          <Card hoverGlow={false} className="relative overflow-hidden bg-bg-secondary/40 border border-border-default/60 hover:border-green-500/30 hover:shadow-[0_0_20px_rgba(34,197,94,0.08)] transition-all duration-300 flex items-center gap-4 py-5">
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-green-500/5 to-transparent rounded-bl-full pointer-events-none" />
            <div className="p-2.5 rounded bg-green-500/10 text-success border border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.08)]">
              <HiCurrencyDollar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-text-muted text-[9px] font-mono uppercase tracking-wider">system.revenue.all</p>
              <p className="text-lg font-bold font-mono mt-0.5 text-accent-gold">
                {formatPrice(stats?.totalRevenue || 0)}
              </p>
            </div>
          </Card>

          <Card hoverGlow={false} className="relative overflow-hidden bg-bg-secondary/40 border border-border-default/60 hover:border-blue-500/30 hover:shadow-[0_0_20px_rgba(59,130,246,0.08)] transition-all duration-300 flex items-center gap-4 py-5">
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-500/5 to-transparent rounded-bl-full pointer-events-none" />
            <div className="p-2.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.08)]">
              <HiBriefcase className="w-5 h-5" />
            </div>
            <div>
              <p className="text-text-muted text-[9px] font-mono uppercase tracking-wider">system.revenue.month</p>
              <p className="text-lg font-bold font-mono mt-0.5 text-accent-gold">
                {formatPrice(stats?.monthlyRevenue || 0)}
              </p>
            </div>
          </Card>
        </div>

        {/* Charts and Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Revenue Chart */}
          <Card className="lg:col-span-2 bg-bg-secondary/30 border border-border-default/60 p-6 flex flex-col shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
            <div className="flex items-center gap-2 mb-6 border-b border-border-default/20 pb-2">
              <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              <h3 className="font-heading text-base font-bold text-accent-gold">
                Kirim Dinamikasi (Oylar kesimida)
              </h3>
            </div>
            
            <div className="w-full h-72 min-h-[280px] mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2A35" />
                  <XAxis dataKey="month" stroke="#8A8694" style={{ fontSize: 12, fontFamily: 'monospace' }} />
                  <YAxis stroke="#8A8694" style={{ fontSize: 12, fontFamily: 'monospace' }} />
                  <Tooltip
                    contentStyle={{ background: '#12121A', borderColor: '#EF4444', color: '#F0EDE6', fontFamily: 'monospace' }}
                    labelStyle={{ color: '#EF4444' }}
                  />
                  <Bar dataKey="revenue" name="Daromad" fill="#EF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Top Products / Info list */}
          <Card className="lg:col-span-1 bg-bg-secondary/30 border border-border-default/60 p-6 shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
            <div className="flex items-center gap-2 mb-4 border-b border-border-default/20 pb-2">
              <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              <h3 className="font-heading text-base font-bold text-accent-gold">
                Tezkor Sozlamalar / Yordam
              </h3>
            </div>
            <div className="space-y-4 text-xs font-mono text-text-secondary">
              <p>&gt; Platforma administratorlar panelida siz quyidagi imkoniyatlarga egasiz:</p>
              <ul className="list-disc pl-5 space-y-2 text-[11px] text-text-muted">
                <li>Yangi mahsulotlar yaratish va dastur fayllarini yuklash</li>
                <li>Mahsulotlar uchun litsenziya kalitlarini yuklab qo&apos;yish</li>
                <li>Buyurtmalarni va Click/Paynet to&apos;lov cheklarini tekshirib tasdiqlash</li>
                <li>Foydalanuvchilarni bloklash va ularning xarid tarixini ko&apos;rish</li>
                <li>Kompaniya blogida yangiliklar va yangi qo&apos;llanmalar joylash</li>
              </ul>
              <div className="pt-2 border-t border-border-default/10 text-[10px] text-accent-gold/70">
                [SYSTEM_STABLE: OK]
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Orders table */}
        <Card className="bg-bg-secondary/30 border border-border-default/60 p-6 shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
          <div className="flex items-center gap-2 mb-4 border-b border-border-default/20 pb-2">
            <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_5px_rgba(239,68,68,0.8)]" />
            <h3 className="font-heading text-base font-bold text-accent-gold">
              So&apos;nggi Xarid Buyurtmalari
            </h3>
          </div>
          
          {recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm font-mono">
                <thead>
                  <tr className="border-b border-border-default/20 text-text-muted text-xs">
                    <th className="pb-3 font-semibold uppercase tracking-wider">Buyurtmachi</th>
                    <th className="pb-3 font-semibold uppercase tracking-wider">Mahsulot</th>
                    <th className="pb-3 font-semibold uppercase tracking-wider">Summa</th>
                    <th className="pb-3 font-semibold uppercase tracking-wider">To&apos;lov turi</th>
                    <th className="pb-3 font-semibold uppercase tracking-wider">Holat</th>
                    <th className="pb-3 font-semibold uppercase tracking-wider">Sana</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-default/10 text-xs">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="text-text-secondary hover:bg-bg-tertiary/20 transition-colors">
                      <td className="py-3">
                        <p className="font-semibold text-text-primary text-xs sm:text-sm font-sans">{order.user?.name}</p>
                        <p className="text-[10px] text-text-muted">{order.user?.email}</p>
                      </td>
                      <td className="py-3 font-sans font-medium text-text-primary">{order.product?.name}</td>
                      <td className="py-3 font-mono text-accent-gold">{formatPrice(order.amount)}</td>
                      <td className="py-3 font-mono text-xs text-text-secondary">{order.paymentType}</td>
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
            <div className="text-center py-6 text-text-muted font-mono text-xs">
              &gt; STATUS_REPORT: Hozircha buyurtmalar kutilmayapti.
            </div>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
}
