'use client';

import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverGlow?: boolean;
}

export function Card({
  children,
  className = '',
  hoverGlow = true,
  ...props
}: CardProps) {
  return (
    <div
      className={`bg-bg-secondary border border-border-default/60 rounded-lg p-5 transition-all duration-300 ${
        hoverGlow ? 'hover:border-accent-gold/40 hover:shadow-[0_0_20px_rgba(201,168,76,0.1)]' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className = '',
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`border-b border-border-default/50 pb-4 mb-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardContent({
  children,
  className = '',
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`${className}`} {...props}>{children}</div>;
}

export function CardFooter({
  children,
  className = '',
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`border-t border-border-default/50 pt-4 mt-4 ${className}`} {...props}>
      {children}
    </div>
  );
}
