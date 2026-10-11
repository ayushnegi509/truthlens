import React from 'react';
import { cn } from '../../utils/cn';

export type ButtonVariant = 
  | 'primary' 
  | 'secondary' 
  | 'outline' 
  | 'ghost' 
  | 'authentic' 
  | 'amber' 
  | 'danger';

export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = 
      'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none select-none rounded-xl';

    const sizeStyles: Record<ButtonSize, string> = {
      sm: 'text-xs px-3 py-1.5 gap-1.5',
      md: 'text-sm px-4 py-2.5 gap-2',
      lg: 'text-base px-6 py-3.5 gap-2.5 font-semibold',
    };

    const variantStyles: Record<ButtonVariant, string> = {
      // Primary Teal/Cyan/Blue Gradient Accent
      primary:
        'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 border border-cyan-400/30 focus-visible:ring-cyan-400',
      
      // Secondary Dark Navy Surface with subtle border
      secondary:
        'bg-slate-100 dark:bg-navy-850 hover:bg-slate-200 dark:hover:bg-navy-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-navy-700/80 shadow-sm focus-visible:ring-slate-400 dark:focus-visible:ring-navy-600',
      
      // Outline
      outline:
        'bg-transparent hover:bg-slate-100 dark:hover:bg-navy-850/80 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-navy-700 hover:border-cyan-500/50 dark:hover:border-cyan-500/50 focus-visible:ring-cyan-400',
      
      // Ghost
      ghost:
        'bg-transparent hover:bg-slate-100 dark:hover:bg-navy-800/60 text-slate-700 dark:text-slate-300 focus-visible:ring-slate-400',

      // Semantic Green (Authentic)
      authentic:
        'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:border-emerald-500/50 focus-visible:ring-emerald-400',

      // Semantic Amber (Suspicious)
      amber:
        'bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:border-amber-500/50 focus-visible:ring-amber-400',

      // Semantic Red (Deepfake / Manipulated)
      danger:
        'bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 hover:border-rose-500/50 focus-visible:ring-rose-400',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
        {...props}
      >
        {isLoading ? (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          leftIcon
        )}
        <span>{children}</span>
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
