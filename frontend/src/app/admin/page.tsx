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
        const [statsData, revData, ordersData] = await Promise.all([
          getAdminStats(),
          getAdminRevenue(),
          getAdminOrders({ limit: '5' })
        ]);
        setStats(statsData);
        setRevenueData(revData);
        setRecentOrders(ordersData);
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
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-accent-gold mb-2">
            Admin Panel Dashboard
          </h1>
          <p className="text-text-secondary text-sm">
            iDev-Hub platformasining umumiy sotuvlari va statistikasi.
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card hoverGlow={false} className="flex items-center gap-4 py-5 bg-bg-secondary border-l-4 border-l-accent-gold border-border-default/60">
            <div className="p-2.5 rounded bg-accent-gold/10 text-accent-gold">
              <HiUsers className="w-5 h-5" />
            </div>
            <div>
              <p className="text-text-muted text-[10px] uppercase tracking-wider font-semibold">Jami Foydalanuvchilar</p>
              <p className="text-xl font-bold font-mono mt-0.5">{stats?.totalUsers || 0}</p>
            </div>
          </Card>

          <Card hoverGlow={false} className="flex items-center gap-4 py-5 bg-bg-secondary border-l-4 border-l-amber-500 border-border-default/60">
            <div className="p-2.5 rounded bg-amber-500/10 text-warning">
              <HiShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <p className="text-text-muted text-[10px] uppercase tracking-wider font-semibold">Jami Buyurtmalar</p>
              <p className="text-xl font-bold font-mono mt-0.5">{stats?.totalOrders || 0}</p>
            </div>
          </Card>

          <Card hoverGlow={false} className="flex items-center gap-4 py-5 bg-bg-secondary border-l-4 border-l-green-500 border-border-default/60">
            <div className="p-2.5 rounded bg-green-500/10 text-success">
              <HiCurrencyDollar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-text-muted text-[10px] uppercase tracking-wider font-semibold">Umumiy Daromad</p>
              <p className="text-lg font-bold font-mono mt-0.5 text-accent-gold">
                {formatPrice(stats?.totalRevenue || 0)}
              </p>
            </div>
          </Card>

          <Card hoverGlow={false} className="flex items-center gap-4 py-5 bg-bg-secondary border-l-4 border-l-blue-500 border-border-default/60">
            <div className="p-2.5 rounded bg-blue-500/10 text-blue-400">
              <HiBriefcase className="w-5 h-5" />
            </div>
            <div>
              <p className="text-text-muted text-[10px] uppercase tracking-wider font-semibold">Oylik Daromad</p>
              <p className="text-lg font-bold font-mono mt-0.5 text-accent-gold">
                {formatPrice(stats?.monthlyRevenue || 0)}
              </p>
            </div>
          </Card>
        </div>

        {/* Charts and Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Revenue Chart */}
          <Card className="lg:col-span-2 bg-bg-secondary/40 border-border-default/60 p-6 flex flex-col">
            <h3 className="font-heading text-base font-bold text-accent-gold mb-6 border-b border-border-default/30 pb-2">
              Kirim Dinamikasi (Oylar kesimida)
            </h3>
            
            <div className="w-full h-72 min-h-[280px] mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2A35" />
                  <XAxis dataKey="month" stroke="#8A8694" style={{ fontSize: 12 }} />
                  <YAxis stroke="#8A8694" style={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ background: '#12121A', borderColor: '#C9A84C', color: '#F0EDE6' }}
                    labelStyle={{ color: '#C9A84C' }}
                  />
                  <Bar dataKey="revenue" name="Daromad" fill="#C9A84C" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Top Products / Info list */}
          <Card className="lg:col-span-1 bg-bg-secondary/40 border-border-default/60 p-6">
            <h3 className="font-heading text-base font-bold text-accent-gold mb-4 border-b border-border-default/30 pb-2">
              Tezkor Sozlamalar / Yordam
            </h3>
            <div className="space-y-4 text-sm text-text-secondary">
              <p>Platforma administratorlar panelida siz quyidagi imkoniyatlarga egasiz:</p>
              <ul className="list-disc pl-5 space-y-2 text-xs">
                <li>Yangi mahsulotlar yaratish va dastur fayllarini yuklash</li>
                <li>Mahsulotlar uchun litsenziya kalitlarini yuklab qo&apos;yish</li>
                <li>Buyurtmalarni va Click/Paynet to&apos;lov cheklarini tekshirib tasdiqlash</li>
                <li>Foydalanuvchilarni bloklash va ularning xarid tarixini ko&apos;rish</li>
                <li>Kompaniya blogida yangiliklar va yangi qo&apos;llanmalar joylash</li>
              </ul>
            </div>
          </Card>
        </div>

        {/* Recent Orders table */}
        <Card className="bg-bg-secondary/40 border-border-default/60 p-6">
          <h3 className="font-heading text-base font-bold text-accent-gold mb-4 border-b border-border-default/30 pb-2">
            So&apos;nggi Xarid Buyurtmalari
          </h3>
          
          {recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border-default/30 text-text-muted">
                    <th className="pb-3 font-semibold">Buyurtmachi</th>
                    <th className="pb-3 font-semibold">Mahsulot</th>
                    <th className="pb-3 font-semibold">Summa</th>
                    <th className="pb-3 font-semibold">To&apos;lov turi</th>
                    <th className="pb-3 font-semibold">Holat</th>
                    <th className="pb-3 font-semibold">Sana</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-default/20">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="text-text-secondary hover:bg-bg-tertiary/10 transition-colors">
                      <td className="py-3">
                        <p className="font-semibold text-text-primary text-xs sm:text-sm">{order.user?.name}</p>
                        <p className="text-[10px] text-text-muted">{order.user?.email}</p>
                      </td>
                      <td className="py-3 font-medium text-text-primary">{order.product?.name}</td>
                      <td className="py-3 font-mono text-accent-gold">{formatPrice(order.amount)}</td>
                      <td className="py-3 font-mono text-xs text-text-secondary">{order.paymentType}</td>
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
            <div className="text-center py-6 text-text-muted">
              Hozircha buyurtmalar kutilmayapti.
            </div>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
}
