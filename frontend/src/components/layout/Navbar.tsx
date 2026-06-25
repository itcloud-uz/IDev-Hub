'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { HiCodeBracket, HiShoppingCart, HiBars3, HiXMark } from 'react-icons/hi2';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'Bosh sahifa', path: '/' },
    { name: 'Katalog', path: '/catalog' },
    { name: 'Haqida', path: '/about' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-bg-primary/80 backdrop-blur-md border-b border-border-gold/20 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <HiCodeBracket className="w-8 h-8 text-accent-gold group-hover:scale-110 transition-transform duration-300" />
              <span className="font-heading text-xl font-bold tracking-wider text-text-primary group-hover:text-accent-gold transition-colors duration-300">
                iDev-<span className="text-accent-gold">Hub</span>
              </span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`relative py-1 text-sm font-medium tracking-wide transition-colors duration-300 hover:text-accent-gold ${
                  isActive(link.path) ? 'text-accent-gold' : 'text-text-secondary'
                }`}
              >
                {link.name}
                {isActive(link.path) && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-gold rounded-full" />
                )}
              </Link>
            ))}
          </div>

          {/* Right Side Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                {isAdmin ? (
                  <Link
                    href="/admin"
                    className={`text-sm font-semibold px-4 py-2 border border-red-500/30 bg-red-500/10 text-error rounded hover:bg-red-500/20 hover:border-error transition-all duration-300 ${
                      pathname.startsWith('/admin') ? 'border-red-500' : ''
                    }`}
                  >
                    Admin panel
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/dashboard"
                      className={`text-sm font-medium hover:text-accent-gold transition-colors ${
                        pathname.startsWith('/dashboard') ? 'text-accent-gold' : 'text-text-secondary'
                      }`}
                    >
                      Shaxsiy kabinet
                    </Link>
                    <Link
                      href="/dashboard/cart"
                      className="p-2 text-text-secondary hover:text-accent-gold relative transition-colors"
                    >
                      <HiShoppingCart className="w-6 h-6" />
                    </Link>
                  </>
                )}
                <button
                  onClick={logout}
                  className="text-sm font-medium px-4 py-2 border border-border-default hover:border-accent-gold/50 rounded hover:bg-bg-tertiary text-text-secondary hover:text-text-primary transition-all duration-300"
                >
                  Chiqish
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-text-secondary hover:text-accent-gold transition-colors duration-300"
                >
                  Kirish
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-medium px-4 py-2 bg-gradient-to-r from-accent-gold to-accent-bronze hover:from-accent-gold-light hover:to-accent-gold text-bg-primary rounded transition-all duration-300 hover:scale-[1.02]"
                >
                  Ro'yxatdan o'tish
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-text-secondary hover:text-accent-gold focus:outline-none p-2"
            >
              {isOpen ? <HiXMark className="w-6 h-6" /> : <HiBars3 className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-bg-secondary/95 border-b border-border-gold/15 backdrop-blur-lg animate-fade-in">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive(link.path)
                    ? 'bg-accent-gold/10 text-accent-gold'
                    : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'
                }`}
              >
                {link.name}
              </Link>
            ))}
            {user ? (
              <>
                {isAdmin ? (
                  <Link
                    href="/admin"
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-error bg-red-500/5 hover:bg-red-500/10"
                  >
                    Admin panel
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/dashboard"
                      onClick={() => setIsOpen(false)}
                      className="block px-3 py-2 rounded-md text-base font-medium text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
                    >
                      Shaxsiy kabinet
                    </Link>
                    <Link
                      href="/dashboard/cart"
                      onClick={() => setIsOpen(false)}
                      className="block px-3 py-2 rounded-md text-base font-medium text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
                    >
                      Savatim
                    </Link>
                  </>
                )}
                <button
                  onClick={() => {
                    setIsOpen(false);
                    logout();
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-error hover:bg-bg-tertiary"
                >
                  Chiqish
                </button>
              </>
            ) : (
              <div className="pt-4 pb-2 border-t border-border-default/55 px-3 space-y-2">
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center py-2 border border-border-default rounded-md text-text-primary font-medium hover:border-accent-gold"
                >
                  Kirish
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center py-2 bg-gradient-to-r from-accent-gold to-accent-bronze text-bg-primary font-medium rounded-md"
                >
                  Ro'yxatdan o'tish
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
