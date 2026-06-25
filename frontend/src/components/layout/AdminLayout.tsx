'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from './Navbar';
import Footer from './Footer';
import {
  HiChartBar,
  HiCircleStack,
  HiCreditCard,
  HiDocumentText,
  HiUsers,
  HiArrowLeftOnRectangle,
  HiShoppingCart
} from 'react-icons/hi2';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, loading, isAdmin, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (!isAdmin) {
        router.push('/dashboard');
      }
    }
  }, [loading, user, isAdmin, router]);

  if (loading || !user || !isAdmin) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-accent-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const sidebarLinks = [
    { name: 'Dashboard', path: '/admin', icon: HiChartBar },
    { name: 'Mahsulotlar', path: '/admin/products', icon: HiCircleStack },
    { name: 'Buyurtmalar', path: '/admin/orders', icon: HiShoppingCart },
    { name: 'To\'lov usullari', path: '/admin/payments', icon: HiCreditCard },
    { name: 'Blog', path: '/admin/blog', icon: HiDocumentText },
    { name: 'Foydalanuvchilar', path: '/admin/users', icon: HiUsers },
  ];

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <Navbar />

      <div className="flex-grow pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar */}
            <aside className="w-full md:w-64 flex-shrink-0">
              <div className="bg-bg-secondary border border-red-500/10 rounded-lg p-4 space-y-1 relative overflow-hidden">
                {/* Admin badge */}
                <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-red-500 to-amber-500" />
                
                <div className="px-3 py-2 border-b border-border-default/40 mb-3 pt-3">
                  <span className="inline-block text-[10px] bg-red-500/15 text-error px-2 py-0.5 rounded font-heading font-semibold uppercase tracking-wider mb-1.5">
                    Admin Kontrol
                  </span>
                  <p className="text-text-primary text-sm font-semibold truncate">{user.name}</p>
                </div>
                {sidebarLinks.map((link) => {
                  const Icon = link.icon;
                  const active = pathname === link.path;
                  return (
                    <Link
                      key={link.path}
                      href={link.path}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded text-sm font-medium transition-all duration-200 ${
                        active
                          ? 'bg-red-500/10 text-error border-l-2 border-red-500 pl-3.5'
                          : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {link.name}
                    </Link>
                  );
                })}
                <button
                  onClick={logout}
                  className="flex w-full items-center gap-3 px-4 py-2.5 rounded text-sm font-medium text-error hover:bg-bg-tertiary/50 transition-colors"
                >
                  <HiArrowLeftOnRectangle className="w-5 h-5" />
                  Chiqish
                </button>
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-grow bg-bg-secondary/40 border border-border-default/45 rounded-lg p-6 min-h-[500px]">
              {children}
            </main>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
