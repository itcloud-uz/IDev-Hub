'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { getCart, getPaymentMethods, createOrder, markAsPaid } from '@/lib/api';
import type { CartItem, PaymentMethod } from '@/types';
import { CATEGORY_LABELS } from '@/types';
import { HiCheckCircle, HiArrowLeft, HiOutlineQrCode } from 'react-icons/hi2';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedMethod, setSelectedMethod] = useState<'CLICK' | 'PAYNET'>('CLICK');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [cartData, methodsData] = await Promise.all([
          getCart(),
          getPaymentMethods()
        ]);
        setCartItems(cartData);
        setPaymentMethods(methodsData);
        if (cartData.length === 0) {
          toast.error('Savatingiz bo\'sh');
          router.push('/dashboard/cart');
        }
      } catch (err) {
        console.error(err);
        toast.error('Ma\'lumotlarni yuklab bo\'lmadi');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  const total = cartItems.reduce((acc, item) => acc + item.product.price, 0);

  const formatPrice = (price: number) =>
    price.toLocaleString('uz-UZ').replace(/,/g, ',') + " so'm";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReceiptFile(e.target.files[0]);
    }
  };

  const handlePaymentSubmit = async () => {
    if (cartItems.length === 0) return;
    
    setSubmitting(true);
    try {
      // Loop through all items and create order
      for (const item of cartItems) {
        const order = await createOrder(item.product.id, selectedMethod);
        
        // If receipt uploaded, submit it
        if (receiptFile && order && order.id) {
          const formData = new FormData();
          formData.append('receipt', receiptFile);
          await markAsPaid(order.id, formData);
        }
      }
      
      setSuccess(true);
      toast.success('To\'lov haqida xabar yuborildi!');
    } catch (err) {
      console.error(err);
      toast.error('Buyurtma rasmiylashtirishda xatolik yuz berdi');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-10 h-10 border-2 border-accent-gold border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (success) {
    return (
      <DashboardLayout>
        <div className="text-center py-16 max-w-md mx-auto space-y-6 animate-fade-in">
          <HiCheckCircle className="w-20 h-20 text-success mx-auto" />
          <h2 className="text-2xl font-heading font-bold text-accent-gold">Buyurtma Qabul Qilindi!</h2>
          <p className="text-text-secondary text-sm">
            Sizning to&apos;lovingiz qabul qilindi. Tez orada administrator uni tekshirib, mahsulotingizni tasdiqlaydi. Shaxsiy kabinetingiz orqali buyurtma holatini kuzatib borishingiz mumkin.
          </p>
          <Button variant="primary" className="w-full" onClick={() => router.push('/dashboard/orders')}>
            Buyurtmalarimga o&apos;tish
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  // Get active payment method details
  const methodDetail = paymentMethods.find((m) => m.name.toUpperCase() === selectedMethod);
  const qrImage = methodDetail?.qrImageUrl ? `http://localhost:5000${methodDetail.qrImageUrl}` : null;
  const instructions = methodDetail?.instructions || `QR kodni skanerlang va to'lovni amalga oshiring.`;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <Link href="/dashboard/cart" className="inline-flex items-center gap-2 text-text-secondary hover:text-accent-gold transition-colors text-sm">
          <HiArrowLeft /> Savatga qaytish
        </Link>

        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-accent-gold mb-2">
            Buyurtmani Rasmiylashtirish
          </h1>
          <p className="text-text-secondary text-sm">
            To&apos;lov turini tanlang va QR kod orqali to&apos;lovni amalga oshiring.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Method Selector & QR */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="flex border-b border-border-default/40">
              <button
                onClick={() => setSelectedMethod('CLICK')}
                className={`flex-grow py-3 text-center text-sm font-semibold tracking-wide border-b-2 transition-all duration-300 ${
                  selectedMethod === 'CLICK'
                    ? 'border-accent-gold text-accent-gold bg-accent-gold/5'
                    : 'border-transparent text-text-secondary hover:text-text-primary'
                }`}
              >
                CLICK
              </button>
              <button
                onClick={() => setSelectedMethod('PAYNET')}
                className={`flex-grow py-3 text-center text-sm font-semibold tracking-wide border-b-2 transition-all duration-300 ${
                  selectedMethod === 'PAYNET'
                    ? 'border-accent-gold text-accent-gold bg-accent-gold/5'
                    : 'border-transparent text-text-secondary hover:text-text-primary'
                }`}
              >
                PAYNET
              </button>
            </div>

            {/* Instruction and QR Code */}
            <Card className="bg-bg-secondary/60 border-border-gold/20 p-6 flex flex-col items-center text-center space-y-6">
              <h3 className="font-heading text-lg font-bold text-text-primary">
                {selectedMethod} orqali to&apos;lash
              </h3>

              {qrImage ? (
                <div className="bg-white p-4 rounded-lg border-2 border-accent-gold/50 shadow-[0_0_20px_rgba(201,168,76,0.15)] max-w-[220px]">
                  <img src={qrImage} alt="QR Code" className="w-[180px] h-[180px] object-contain" />
                </div>
              ) : (
                <div className="w-[200px] h-[200px] border border-dashed border-border-default/80 rounded-lg flex flex-col items-center justify-center text-text-muted bg-bg-tertiary">
                  <HiOutlineQrCode className="w-12 h-12 mb-2" />
                  <span className="text-xs">QR Kod mavjud emas</span>
                </div>
              )}

              <p className="text-text-secondary text-sm max-w-md leading-relaxed">
                {instructions}
              </p>
            </Card>

            {/* Receipt Upload */}
            <Card className="bg-bg-secondary/60 border-border-default/60 p-6 space-y-4">
              <h3 className="font-heading text-base font-bold text-accent-gold">
                To&apos;lov chekini yuklash (Skrinshot)
              </h3>
              <p className="text-text-secondary text-xs">
                To&apos;lovingiz tezda tasdiqlanishi uchun Click/Paynet ilovasidagi to&apos;lov chekini yuklang.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <input
                  type="file"
                  id="receipt"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="receipt"
                  className="cursor-pointer px-4 py-2 border border-border-default hover:border-accent-gold hover:bg-bg-tertiary rounded text-sm text-text-secondary hover:text-text-primary transition-all duration-200"
                >
                  Fayl tanlash
                </label>
                <span className="text-xs font-mono text-text-muted truncate max-w-xs">
                  {receiptFile ? receiptFile.name : 'Chek yuklanmagan'}
                </span>
              </div>
            </Card>
          </div>

          {/* Cart Preview and Submit */}
          <div className="lg:col-span-1">
            <Card className="bg-bg-secondary/70 border-border-default/60 p-6 sticky top-24 space-y-6">
              <h3 className="font-heading text-lg font-bold text-accent-gold border-b border-border-default/30 pb-2">
                Buyurtma tarkibi
              </h3>

              <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-xs gap-2 py-1">
                    <span className="text-text-secondary font-medium truncate">{item.product.name}</span>
                    <span className="font-mono text-accent-gold flex-shrink-0">{formatPrice(item.product.price)}</span>
                  </div>
                ))}
              </div>

              <hr className="border-border-default/45" />

              <div className="space-y-2">
                <div className="flex justify-between text-sm text-text-secondary">
                  <span>Soni:</span>
                  <span className="font-mono">{cartItems.length} dona</span>
                </div>
                <div className="flex justify-between text-base font-bold text-text-primary">
                  <span>Jami to&apos;lov:</span>
                  <span className="font-mono text-accent-gold">{formatPrice(total)}</span>
                </div>
              </div>

              <Button
                variant="primary"
                className="w-full mt-4"
                isLoading={submitting}
                onClick={handlePaymentSubmit}
              >
                To&apos;ladim
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
