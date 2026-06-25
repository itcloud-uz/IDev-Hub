'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import MatrixRain from '@/components/ui/MatrixRain';
import ParticleNetwork from '@/components/ui/ParticleNetwork';
import { getProduct, addToCart } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import type { Product } from '@/types';
import { CATEGORY_LABELS } from '@/types';
import { HiCube, HiShoppingCart, HiArrowLeft, HiCpuChip, HiCodeBracket, HiCommandLine, HiPaintBrush } from 'react-icons/hi2';
import toast from 'react-hot-toast';

const categoryIcons: Record<string, React.ReactNode> = {
  SERVER_TOOLS: <HiCube className="w-12 h-12" />,
  AI_BOTS: <HiCpuChip className="w-12 h-12" />,
  WEB_DEV: <HiCodeBracket className="w-12 h-12" />,
  DEVOPS: <HiCommandLine className="w-12 h-12" />,
  MOBILE_DEV: <HiPaintBrush className="w-12 h-12" />,
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const { isAuthenticated } = useAuth();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [buying, setBuying] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      if (!id) return;
      try {
        const res = await getProduct(id as string);
        setProduct(res.data.product);
      } catch (err) {
        console.error('Failed to load product', err);
        toast.error('Mahsulot yuklanmadi');
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Savatga qo\'shish uchun oldin tizimga kiring!');
      router.push('/login');
      return;
    }
    setAdding(true);
    try {
      await addToCart(product!.id);
      toast.success('Savatga qo\'shildi!');
    } catch (err) {
      console.error(err);
      toast.error('Savatga qo\'shib bo\'lmadi');
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    setBuying(true);
    try {
      await addToCart(product!.id);
      router.push('/dashboard/checkout');
    } catch (err) {
      console.error(err);
      // If already in cart, redirect anyway
      router.push('/dashboard/checkout');
    } finally {
      setBuying(false);
    }
  };

  const formatPrice = (price: number) =>
    price.toLocaleString('uz-UZ').replace(/,/g, ',') + " so'm";

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 opacity-[0.10] pointer-events-none z-0">
          <MatrixRain color="gold" />
        </div>
        <div className="absolute inset-0 opacity-[0.08] pointer-events-none z-0">
          <ParticleNetwork color="gold" />
        </div>
        <Navbar />
        <div className="flex-grow flex items-center justify-center relative z-10">
          <div className="w-10 h-10 border-2 border-accent-gold border-t-transparent rounded-full animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 opacity-[0.10] pointer-events-none z-0">
          <MatrixRain color="gold" />
        </div>
        <div className="absolute inset-0 opacity-[0.08] pointer-events-none z-0">
          <ParticleNetwork color="gold" />
        </div>
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center p-8 relative z-10">
          <p className="text-xl text-text-secondary mb-4">Mahsulot topilmadi</p>
          <Link href="/catalog" className="text-accent-gold flex items-center gap-2 hover:underline">
            <HiArrowLeft /> Katalokka qaytish
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary font-body flex flex-col relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 opacity-[0.10] pointer-events-none z-0">
        <MatrixRain color="gold" />
      </div>
      <div className="absolute inset-0 opacity-[0.08] pointer-events-none z-0">
        <ParticleNetwork color="gold" />
      </div>

      <Navbar />

      <main className="flex-grow pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 relative z-10">
        <Link href="/catalog" className="inline-flex items-center gap-2 text-text-secondary hover:text-accent-gold transition-colors mb-6 text-sm">
          <HiArrowLeft /> Katalokka qaytish
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Image/Icon */}
          <div className="lg:col-span-1">
            <Card className="flex flex-col items-center justify-center py-16 bg-bg-secondary/40 border-border-gold/30">
              <div className="w-24 h-24 bg-bg-tertiary rounded-2xl flex items-center justify-center text-accent-gold mb-6 border border-border-gold/20">
                {categoryIcons[product.category] || <HiCube className="w-12 h-12" />}
              </div>
              <Badge variant="gold" className="text-sm">
                {CATEGORY_LABELS[product.category] || product.category}
              </Badge>
            </Card>
          </div>

          {/* Right Column - Product details */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-heading font-bold text-text-primary tracking-wide mb-2">
                {product.name}
              </h1>
              <p className="text-accent-gold font-bold text-2xl font-mono">
                {formatPrice(product.price)}
              </p>
            </div>

            <hr className="border-border-default/50" />

            <div className="space-y-4">
              <h3 className="font-heading text-lg font-bold text-accent-gold">Tavsif</h3>
              <p className="text-text-secondary leading-relaxed whitespace-pre-line text-sm sm:text-base">
                {product.description}
              </p>
            </div>

            <hr className="border-border-default/50" />

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="primary"
                className="flex-grow sm:flex-grow-0"
                isLoading={buying}
                onClick={handleBuyNow}
              >
                Hozir sotib olish
              </Button>
              <Button
                variant="secondary"
                className="flex-grow sm:flex-grow-0"
                isLoading={adding}
                onClick={handleAddToCart}
              >
                <HiShoppingCart className="w-5 h-5 mr-2" />
                Savatga qo&apos;shish
              </Button>
            </div>

            {!isAuthenticated && (
              <p className="text-text-muted text-xs">
                * Mahsulotni sotib olish yoki savatga qo&apos;shish uchun oldin tizimga kirishingiz kerak.
              </p>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
