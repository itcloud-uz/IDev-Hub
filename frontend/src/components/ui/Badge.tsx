'use client';

import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'default' | 'gold';
  className?: string;
}

export default function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const styles = {
    default: 'bg-bg-tertiary text-text-secondary border-border-default/80',
    success: 'bg-green-500/10 text-success border-success/30',
    warning: 'bg-amber-500/10 text-warning border-warning/30',
    error: 'bg-red-500/10 text-error border-error/30',
    gold: 'bg-accent-gold/10 text-accent-gold border-accent-gold/30',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
