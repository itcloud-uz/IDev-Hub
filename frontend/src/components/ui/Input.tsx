'use client';

import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label?: string;
  error?: string;
  textarea?: boolean;
  rows?: number;
}

const Input = forwardRef<HTMLInputElement & HTMLTextAreaElement, InputProps>(
  ({ label, error, textarea = false, rows = 4, className = '', ...props }, ref) => {
    const inputStyles = `w-full bg-bg-tertiary text-text-primary placeholder:text-text-muted border ${
      error ? 'border-error' : 'border-border-default/80 hover:border-accent-gold/40'
    } rounded px-4 py-2.5 outline-none focus:border-accent-gold transition-all duration-300 font-mono text-sm`;

    return (
      <div className={`w-full ${className}`}>
        {label && (
          <label className="block text-sm font-medium text-text-secondary mb-1.5 font-heading">
            {label}
          </label>
        )}
        {textarea ? (
          <textarea
            ref={ref}
            rows={rows}
            className={inputStyles}
            {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <input
            ref={ref}
            className={inputStyles}
            {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
          />
        )}
        {error && <p className="text-error text-xs mt-1 font-sans">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
