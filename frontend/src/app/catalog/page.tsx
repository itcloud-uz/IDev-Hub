'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Badge from '@/components/ui/Badge';
import { getProducts } from '@/lib/api';
import type { Product } from '@/types';
import { CATEGORY_LABELS } from '@/types';
import { HiCube, HiCodeBracket, HiCpuChip, HiPaintBrush, HiCommandLine } from 'react-icons/hi2';

const categoryIcons: Record<string, React.ReactNode> = {
  SERVER_TOOLS: <HiCube className="w-8 h-8" />,
  AI_BOTS: <HiCpuChip className="w-8 h-8" />,
  WEB_DEV: <HiCodeBracket className="w-8 h-8" />,
  DEVOPS: <HiCommandLine className="w-8 h-8" />,
  MOBILE_DEV: <HiPaintBrush className="w-8 h-8" />,
};

const categoryOptions = [
  { value: 'ALL', label: 'Barcha kategoriyalar' },
  { value: 'SERVER_TOOLS', label: 'Server vositalari' },
  { value: 'AI_BOTS', label: 'AI/Botlar' },
  { value: 'WEB_DEV', label: 'Web dasturlash' },
  { value: 'DEVOPS', label: 'DevOps' },
  { value: 'MOBILE_DEV', label: 'Mobil dasturlash' },
];

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');

  useEffect(() => {
    async function fetchProductsData() {
      setLoading(true);
      try {
        const params: Record<string, string> = {};
        if (category !== 'ALL') params.category = category;
        if (search) params.search = search;
        
        const data = await getProducts(params);
        setProducts(data);
      } catch (err) {
        console.error('Failed to load products', err);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(() => {
      fetchProductsData();
    }, 300);

    return () => clearTimeout(timer);
  }, [category, search]);

  const formatPrice = (price: number) =>
    price.toLocaleString('uz-UZ').replace(/,/g, ',') + " so'm";

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary font-body flex flex-col">
      <Navbar />

      <main className="flex-grow pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Header */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-accent-gold mb-3">
            Mahsulotlar Katalogi
          </h1>
          <div className="h-0.5 w-32 bg-gradient-to-r from-accent-gold to-transparent mx-auto md:mx-0 rounded" />
        </div>

        {/* Filters */}
        <Card className="mb-8 p-4 bg-bg-secondary/70 border-border-default/40">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="md:col-span-2">
              <Input
                placeholder="Qidirish (nomi yoki tavsifi bo'yicha)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div>
              <Select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                options={categoryOptions}
              />
            </div>
          </div>
        </Card>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="w-12 h-12 bg-bg-tertiary rounded-lg mb-4" />
                <div className="h-5 bg-bg-tertiary rounded w-3/4 mb-3" />
                <div className="h-4 bg-bg-tertiary rounded w-1/2 mb-4" />
                <div className="h-4 bg-bg-tertiary rounded w-1/3" />
              </Card>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="flex flex-col h-full">
                <div className="w-14 h-14 bg-bg-tertiary rounded-lg flex items-center justify-center text-accent-gold mb-4">
                  {categoryIcons[product.category] || <HiCube className="w-8 h-8" />}
                </div>
                
                <h3 className="text-lg font-semibold text-text-primary mb-2 line-clamp-1">
                  {product.name}
                </h3>
                
                <div className="mb-3">
                  <Badge variant="gold">
                    {CATEGORY_LABELS[product.category] || product.category}
                  </Badge>
                </div>

                <p className="text-text-secondary text-sm line-clamp-3 mb-6 flex-grow">
                  {product.description}
                </p>

                <div className="flex items-center justify-between border-t border-border-default/30 pt-4 mt-auto">
                  <span className="text-accent-gold font-bold text-lg">
                    {formatPrice(product.price)}
                  </span>
                  
                  <Link
                    href={`/catalog/${product.id}`}
                    className="text-sm font-semibold text-accent-gold hover:text-accent-gold-light transition-colors"
                  >
                    Batafsil →
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-bg-secondary/20 border border-border-default/40 rounded-lg">
            <HiCube className="w-16 h-16 text-text-muted mx-auto mb-4" />
            <p className="text-text-secondary text-lg">Qidiruv bo&apos;yicha hech qanday mahsulot topilmadi.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
