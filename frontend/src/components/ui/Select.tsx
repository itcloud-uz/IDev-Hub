'use client';

import React, { forwardRef } from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', ...props }, ref) => {
    return (
      <div className={`w-full ${className}`}>
        {label && (
          <label className="block text-sm font-medium text-text-secondary mb-1.5 font-heading">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`w-full bg-bg-tertiary text-text-primary border ${
            error ? 'border-error' : 'border-border-default/80 hover:border-accent-gold/40'
          } rounded px-4 py-2.5 outline-none focus:border-accent-gold transition-all duration-300 font-sans text-sm cursor-pointer`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-bg-secondary text-text-primary">
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-error text-xs mt-1 font-sans">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
