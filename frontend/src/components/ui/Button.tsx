'use client';

import React from 'react';
import { ImSpinner2 } from 'react-icons/im';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export default function Button({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-300 rounded border outline-none disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-gradient-to-r from-accent-gold to-accent-bronze hover:from-accent-gold-light hover:to-accent-gold text-bg-primary border-accent-gold shadow-md hover:shadow-accent-gold/20 hover:scale-[1.02]',
    secondary: 'bg-transparent text-accent-gold border-accent-gold/40 hover:border-accent-gold hover:bg-accent-gold/5',
    danger: 'bg-red-500/10 text-error border-error/30 hover:border-error hover:bg-red-500/20',
    ghost: 'bg-transparent border-transparent text-text-secondary hover:text-text-primary hover:bg-bg-tertiary',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-8 py-3 text-lg font-heading',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <ImSpinner2 className="animate-spin mr-2" />
          Yuklanmoqda...
        </>
      ) : (
        children
      )}
    </button>
  );
}
