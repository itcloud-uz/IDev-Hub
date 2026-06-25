'use client';

import React from 'react';
import Link from 'next/link';
import { HiCodeBracket } from 'react-icons/hi2';
import { FaGithub, FaTelegram, FaLinkedin } from 'react-icons/fa';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-bg-secondary border-t border-border-default/60 py-12 mt-auto">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <HiCodeBracket className="w-7 h-7 text-accent-gold" />
              <span className="font-heading text-lg font-bold tracking-wider text-text-primary">
                iDev-<span className="text-accent-gold">Hub</span>
              </span>
            </Link>
            <p className="text-text-secondary text-sm max-w-sm">
              Faqat dasturchilar uchun mo'ljallangan marketplace platforma. Eng sara development vositalari, server shablonlari va AI agent shablonlarini shu yerdan topasiz.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-text-secondary hover:text-accent-gold transition-colors duration-300">
                <FaTelegram className="w-5 h-5" />
              </a>
              <a href="#" className="text-text-secondary hover:text-accent-gold transition-colors duration-300">
                <FaGithub className="w-5 h-5" />
              </a>
              <a href="#" className="text-text-secondary hover:text-accent-gold transition-colors duration-300">
                <FaLinkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading text-sm font-bold tracking-wider text-accent-gold uppercase mb-4">
              Sahifalar
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-text-secondary hover:text-text-primary transition-colors duration-200">
                  Bosh sahifa
                </Link>
              </li>
              <li>
                <Link href="/catalog" className="text-text-secondary hover:text-text-primary transition-colors duration-200">
                  Katalog
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-text-secondary hover:text-text-primary transition-colors duration-200">
                  Haqida
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-heading text-sm font-bold tracking-wider text-accent-gold uppercase mb-4">
              Yordam
            </h4>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li>Aloqa: support@idev-hub.com</li>
              <li>Telegram bot: @idev_support_bot</li>
              <li>Ish vaqti: 24/7</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border-default/40 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-text-muted">
          <p>© {currentYear} iDev-Hub. Barcha huquqlar himoyalangan.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-text-secondary transition-colors">Foydalanish shartlari</a>
            <a href="#" className="hover:text-text-secondary transition-colors">Maxfiylik siyosati</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
