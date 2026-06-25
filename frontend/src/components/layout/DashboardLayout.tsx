'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from './Navbar';
import Footer from './Footer';
import { HiUser, HiShoppingCart, HiListBullet, HiKey, HiArrowLeftOnRectangle } from 'react-icons/hi2';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-accent-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const sidebarLinks = [
    { name: 'Profil', path: '/dashboard/profile', icon: HiUser },
    { name: 'Katalog', path: '/catalog', icon: HiListBullet },
    { name: 'Savatim', path: '/dashboard/cart', icon: HiShoppingCart },
    { name: 'Buyurtmalarim', path: '/dashboard/orders', icon: HiKey },
  ];

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <Navbar />

      <div className="flex-grow pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar */}
            <aside className="w-full md:w-64 flex-shrink-0">
              <div className="bg-bg-secondary border border-border-default/60 rounded-lg p-4 space-y-1">
                <div className="px-3 py-2 border-b border-border-default/40 mb-3">
                  <p className="text-text-muted text-xs uppercase tracking-wider">Shaxsiy kabinet</p>
                  <p className="text-text-primary text-sm font-semibold truncate mt-1">{user?.name}</p>
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
                          ? 'bg-accent-gold/10 text-accent-gold border-l-2 border-accent-gold pl-3.5'
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
