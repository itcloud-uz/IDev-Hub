'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { getCart, removeFromCart, clearCart } from '@/lib/api';
import type { CartItem } from '@/types';
import { CATEGORY_LABELS } from '@/types';
import { HiShoppingCart, HiTrash, HiArrowRight, HiCube } from 'react-icons/hi2';
import toast from 'react-hot-toast';

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);

  async function loadCart() {
    try {
      const data = await getCart();
      setCartItems(data);
    } catch (err) {
      console.error(err);
      toast.error('Savatni yuklashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCart();
  }, []);

  const handleRemove = async (id: string) => {
    try {
      await removeFromCart(id);
      toast.success('Mahsulot savatdan o\'chirildi');
      loadCart();
    } catch (err) {
      console.error(err);
      toast.error('O\'chirishda xatolik yuz berdi');
    }
  };

  const handleClear = async () => {
    if (cartItems.length === 0) return;
    setClearing(true);
    try {
      await clearCart();
      toast.success('Savat tozalandi');
      setCartItems([]);
    } catch (err) {
      console.error(err);
      toast.error('Savatni tozalashda xatolik yuz berdi');
    } finally {
      setClearing(false);
    }
  };

  const total = cartItems.reduce((acc, item) => acc + item.product.price, 0);

  const formatPrice = (price: number) =>
    price.toLocaleString('uz-UZ').replace(/,/g, ',') + " so'm";

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-accent-gold mb-2">
              Savatim
            </h1>
            <p className="text-text-secondary text-sm">
              Sotib olishga tayyorlangan mahsulotlaringiz.
            </p>
          </div>
          {cartItems.length > 0 && (
            <Button
              variant="danger"
              size="sm"
              isLoading={clearing}
              onClick={handleClear}
              className="self-start sm:self-center"
            >
              <HiTrash className="w-4 h-4 mr-1.5" />
              Savatni tozalash
            </Button>
          )}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <Card key={i} className="animate-pulse h-20" />
            ))}
          </div>
        ) : cartItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items List */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id} className="flex items-center justify-between gap-4 py-4 bg-bg-secondary/60">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-bg-tertiary rounded flex items-center justify-center text-accent-gold border border-border-gold/10">
                      <HiCube className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-semibold text-text-primary">
                        {item.product.name}
                      </h4>
                      <Badge variant="gold" className="text-[10px] mt-1">
                        {CATEGORY_LABELS[item.product.category] || item.product.category}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-mono text-accent-gold text-sm sm:text-base font-bold">
                      {formatPrice(item.product.price)}
                    </span>
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="text-text-muted hover:text-error transition-colors p-1.5"
                    >
                      <HiTrash className="w-5 h-5" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="bg-bg-secondary/70 border-border-gold/20 p-6 sticky top-24">
                <h3 className="font-heading text-lg font-bold text-accent-gold mb-4 border-b border-border-default/30 pb-2">
                  Xarid Tafsiloti
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-text-secondary">
                    <span>Mahsulotlar soni:</span>
                    <span className="font-mono">{cartItems.length} dona</span>
                  </div>
                  <div className="flex justify-between text-text-secondary">
                    <span>Yetkazib berish:</span>
                    <span className="font-mono text-success">Mavjud (Download)</span>
                  </div>
                  <hr className="border-border-default/40 my-3" />
                  <div className="flex justify-between text-text-primary text-base font-bold">
                    <span>Jami:</span>
                    <span className="font-mono text-accent-gold">{formatPrice(total)}</span>
                  </div>
                </div>

                <Button
                  variant="primary"
                  className="w-full mt-6"
                  onClick={() => router.push('/dashboard/checkout')}
                >
                  Buyurtmani Rasmiylashtirish <HiArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Card>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 bg-bg-secondary/20 border border-border-default/40 rounded-lg">
            <HiShoppingCart className="w-16 h-16 text-text-muted mx-auto mb-4" />
            <p className="text-text-secondary text-lg mb-4">Savatingiz hozircha bo&apos;sh.</p>
            <Link href="/catalog" className="text-accent-gold hover:underline font-semibold">
              Katalogni aylanib chiqing →
            </Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
