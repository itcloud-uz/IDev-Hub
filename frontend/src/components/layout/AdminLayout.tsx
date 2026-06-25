'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from './Navbar';
import Footer from './Footer';
import ParticleNetwork from '@/components/ui/ParticleNetwork';
import MatrixRain from '@/components/ui/MatrixRain';
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
    <div className="min-h-screen bg-bg-primary flex flex-col relative overflow-hidden">
      {/* Interactive nodes background */}
      <div className="absolute inset-0 opacity-[0.12] pointer-events-none z-0">
        <MatrixRain color="red" />
      </div>
      <div className="absolute inset-0 opacity-[0.10] pointer-events-none z-0">
        <ParticleNetwork color="red" />
      </div>

      <Navbar />

      <div className="flex-grow pt-16 relative z-10">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar */}
            <aside className="w-full md:w-64 flex-shrink-0 flex flex-col">
              <div className="bg-bg-secondary/70 backdrop-blur-md border border-red-500/20 rounded-lg p-4 space-y-1 relative shadow-[0_4px_30px_rgba(0,0,0,0.4)] overflow-hidden group hover:border-red-500/40 transition-colors duration-300 h-full flex-grow">
                {/* macOS control dots */}
                <div className="flex items-center justify-between pb-3 border-b border-border-default/20 mb-3">
                  <div className="flex space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500/80 shadow-[0_0_6px_rgba(239,68,68,0.4)]" />
                    <span className="w-2 h-2 rounded-full bg-yellow-500/80 shadow-[0_0_6px_rgba(234,179,8,0.4)]" />
                    <span className="w-2 h-2 rounded-full bg-green-500/80 shadow-[0_0_6px_rgba(34,197,94,0.4)]" />
                  </div>
                  <span className="text-[9px] font-mono text-error">sudo - admin.sh</span>
                </div>
                
                <div className="px-3 py-2 bg-red-500/5 rounded border border-red-500/10 mb-3 font-mono">
                  <span className="inline-block text-[9px] bg-red-500/15 text-error px-1.5 py-0.5 rounded font-heading font-semibold uppercase tracking-wider mb-1">
                    ROOT_ACCESS
                  </span>
                  <p className="text-text-primary text-xs font-semibold truncate mt-0.5"># {user?.name}</p>
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
                          ? 'bg-red-500/15 text-error border-l-2 border-red-500 pl-3.5 shadow-[inset_0_0_10px_rgba(239,68,68,0.08)]'
                          : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/60'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${active ? 'text-error' : 'text-text-muted'}`} />
                      <span className="font-mono text-xs">{link.name}</span>
                    </Link>
                  );
                })}
                <button
                  onClick={logout}
                  className="flex w-full items-center gap-3 px-4 py-2.5 rounded text-sm font-medium text-error hover:bg-red-500/10 hover:text-red-400 transition-colors"
                >
                  <HiArrowLeftOnRectangle className="w-4 h-4" />
                  <span className="font-mono text-xs">Chiqish</span>
                </button>
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-grow bg-bg-secondary/30 backdrop-blur-sm border border-border-default/45 rounded-lg p-6 min-h-[500px] relative z-10 shadow-[0_4px_30px_rgba(0,0,0,0.2)]">
              {children}
            </main>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
