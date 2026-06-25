'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { getAdminUsers, toggleBlockUser, getAdminUser } from '@/lib/api';
import type { User, Order } from '@/types';
import { STATUS_LABELS } from '@/types';
import { HiOutlineUserMinus, HiOutlineUserPlus, HiOutlineEye } from 'react-icons/hi2';
import Modal from '@/components/ui/Modal';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<(User & { _count?: { orders: number } })[]>([]);
  const [loading, setLoading] = useState(true);

  // User detail states
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [loadingUserDetail, setLoadingUserDetail] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  async function loadUsers() {
    try {
      const res = await getAdminUsers();
      setUsers(res.data.users || []);
    } catch (err) {
      console.error(err);
      toast.error('Foydalanuvchilarni yuklab bo\'lmadi');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const handleBlockToggle = async (id: string, currentBlockedStatus: boolean) => {
    const action = currentBlockedStatus ? 'blokdan ochmoqchimisiz' : 'bloklamoqchimisiz';
    if (!window.confirm(`Haqiqatdan ham ushbu foydalanuvchini ${action}?`)) return;

    try {
      await toggleBlockUser(id);
      toast.success(currentBlockedStatus ? 'Foydalanuvchi blokdan ochildi' : 'Foydalanuvchi bloklandi');
      loadUsers();
    } catch (err) {
      console.error(err);
      toast.error('Xatolik yuz berdi');
    }
  };

  const handleViewDetails = async (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
    setLoadingUserDetail(true);
    try {
      const res = await getAdminUser(user.id);
      setUserOrders(res.data.user.orders || []);
    } catch (err) {
      console.error(err);
      toast.error('Xaridlar tarixini yuklab bo\'lmadi');
    } finally {
      setLoadingUserDetail(false);
    }
  };

  const formatPrice = (price: number) =>
    price.toLocaleString('uz-UZ').replace(/,/g, ',') + " so'm";

  return (
    <AdminLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-accent-gold mb-2">
            Foydalanuvchilarni boshqarish
          </h1>
          <p className="text-text-secondary text-sm">
            Ro&apos;yxatdan o&apos;tgan dasturchilar ro&apos;yxati va ularni bloklash/ochish nazorati.
          </p>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse h-16" />
            ))}
          </div>
        ) : users.length > 0 ? (
          <Card className="bg-bg-secondary/40 border-border-default/60 p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border-default/45 text-text-muted bg-bg-secondary/70">
                    <th className="px-6 py-4 font-semibold">Ism va Email</th>
                    <th className="px-6 py-4 font-semibold">Ro&apos;l</th>
                    <th className="px-6 py-4 font-semibold">Xaridlar soni</th>
                    <th className="px-6 py-4 font-semibold">Holat</th>
                    <th className="px-6 py-4 font-semibold">Ro&apos;yxatdan o&apos;tgan sana</th>
                    <th className="px-6 py-4 font-semibold text-right">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-default/20">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-bg-tertiary/10 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-text-primary text-sm">{u.name}</p>
                        <p className="text-xs text-text-muted">{u.email}</p>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs">
                        <Badge variant={u.role === 'ADMIN' ? 'gold' : 'default'}>
                          {u.role}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 font-mono text-sm">
                        {u._count?.orders ?? 0} ta
                      </td>
                      <td className="px-6 py-4">
                        {u.blocked ? (
                          <Badge variant="error">Bloklangan</Badge>
                        ) : (
                          <Badge variant="success">Faol</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs font-mono">
                        {new Date(u.createdAt).toLocaleDateString('uz-UZ')}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleViewDetails(u)}
                          title="Xaridlar tarixi"
                          className="text-text-secondary hover:text-accent-gold transition-colors p-1"
                        >
                          <HiOutlineEye className="w-5 h-5 inline" />
                        </button>
                        
                        {u.role !== 'ADMIN' && (
                          <button
                            onClick={() => handleBlockToggle(u.id, u.blocked)}
                            title={u.blocked ? "Blokdan ochish" : "Bloklash"}
                            className={`p-1 transition-colors ${
                              u.blocked
                                ? 'text-green-500 hover:text-green-400'
                                : 'text-text-secondary hover:text-error'
                            }`}
                          >
                            {u.blocked ? (
                              <HiOutlineUserPlus className="w-5 h-5 inline" />
                            ) : (
                              <HiOutlineUserMinus className="w-5 h-5 inline" />
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ) : (
          <div className="text-center py-12 text-text-muted">
            Foydalanuvchilar ro&apos;yxati bo&apos;sh.
          </div>
        )}

        {/* User Details & Purchases Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`Foydalanuvchi xaridlari: ${selectedUser?.name}`}
          size="lg"
        >
          {loadingUserDetail ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-accent-gold border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="border-b border-border-default/30 pb-3 mb-3 text-sm text-text-secondary">
                <p>Email: <span className="text-text-primary font-mono">{selectedUser?.email}</span></p>
                <p className="mt-1">A&apos;zolik sanasi: <span className="text-text-primary font-mono">{selectedUser?.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString('uz-UZ') : ''}</span></p>
              </div>

              <h4 className="font-heading text-sm font-semibold text-accent-gold">Xarid qilgan mahsulotlari ({userOrders.length})</h4>
              
              <div className="max-h-60 overflow-y-auto border border-border-default/50 rounded divide-y divide-border-default/20 bg-bg-tertiary/45">
                {userOrders.length > 0 ? (
                  userOrders.map((order) => (
                    <div key={order.id} className="p-3 flex items-center justify-between text-xs gap-3">
                      <div>
                        <p className="font-semibold text-text-primary">{order.product?.name}</p>
                        <p className="text-[10px] text-text-muted font-mono mt-0.5">
                          Sana: {new Date(order.createdAt).toLocaleDateString('uz-UZ')} • To&apos;lov: {order.paymentType}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-accent-gold block font-semibold">{formatPrice(order.amount)}</span>
                        <span className="text-[10px] font-medium block mt-0.5">
                          Status: <span className={order.status === 'CONFIRMED' ? 'text-success' : order.status === 'PENDING' ? 'text-warning' : 'text-error'}>{STATUS_LABELS[order.status]}</span>
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-8 text-text-muted text-xs">Foydalanuvchi hali hech narsa sotib olmagan.</p>
                )}
              </div>
            </div>
          )}
        </Modal>
      </div>
    </AdminLayout>
  );
}
