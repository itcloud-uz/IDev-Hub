'use client';

import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card } from '@/components/ui/Card';
import { HiCodeBracket, HiOutlineBolt, HiOutlineShieldCheck, HiOutlineSparkles } from 'react-icons/hi2';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary font-body flex flex-col">
      <Navbar />

      <main className="flex-grow pt-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Title */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-accent-gold mb-4">
            Biz Haqimizda
          </h1>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            iDev-Hub platformasi dasturchilar va jamoalar uchun development jarayonini tezlashtirish va osonlashtirish maqsadida yaratilgan.
          </p>
          <div className="h-1 w-24 bg-gradient-to-r from-accent-gold to-accent-bronze mx-auto rounded-full mt-6" />
        </div>

        {/* Info Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center p-6 bg-bg-secondary/40 border-border-default/50">
            <HiOutlineBolt className="w-12 h-12 text-accent-gold mx-auto mb-4" />
            <h3 className="text-lg font-heading font-bold text-text-primary mb-2">Tezkorlik</h3>
            <p className="text-text-secondary text-sm">
              Sotib olingan har qanday dasturiy mahsulot yoki litsenziya kaliti lahzada yuklab olish uchun tayyor bo&apos;ladi.
            </p>
          </Card>

          <Card className="text-center p-6 bg-bg-secondary/40 border-border-default/50">
            <HiOutlineShieldCheck className="w-12 h-12 text-accent-gold mx-auto mb-4" />
            <h3 className="text-lg font-heading font-bold text-text-primary mb-2">Ishonchlilik</h3>
            <p className="text-text-secondary text-sm">
              Barcha dasturlar administratorlarimiz tomonidan xavfsizlik va barqarorlik bo&apos;yicha to&apos;liq tekshiriladi.
            </p>
          </Card>

          <Card className="text-center p-6 bg-bg-secondary/40 border-border-default/50">
            <HiOutlineSparkles className="w-12 h-12 text-accent-gold mx-auto mb-4" />
            <h3 className="text-lg font-heading font-bold text-text-primary mb-2">Eksklyuzivlik</h3>
            <p className="text-text-secondary text-sm">
              Siz uchun eng sara AI agent shablonlari, telegram botlar va server konfiguratsiyalarini saralab olamiz.
            </p>
          </Card>
        </div>

        {/* Content Section */}
        <Card className="p-8 bg-bg-secondary/30 border-border-gold/20 mb-16">
          <div className="space-y-6">
            <h2 className="text-2xl font-heading font-bold text-accent-gold flex items-center gap-2">
              <HiCodeBracket className="w-6 h-6" /> Bizning Maqsadimiz
            </h2>
            <p className="text-text-secondary leading-relaxed">
              Dasturchilar ko&apos;p vaqtini tayyorgarlik ishlariga, serverlarni sozlashga va takrorlanuvchi kodlarni yozishga sarflashadi. Bizning maqsadimiz — sizga eng yaxshi tayyor yechimlarni taklif qilish orqali vaqtingizni va kuchingizni tejashdir.
            </p>
            <p className="text-text-secondary leading-relaxed">
              Bu marketplace faqat dasturchilar uchun mo&apos;ljallangan va undagi har bir vosita kod yozish jarayonini tezlashtirish uchun foydalidir.
            </p>
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
