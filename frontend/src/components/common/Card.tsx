import React from 'react';
import { cn } from '../../utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'interactive' | 'accent' | 'authentic' | 'amber' | 'danger';
  glow?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', glow = false, children, ...props }, ref) => {
    const baseStyles = 'rounded-2xl transition-all duration-200';

    const variantStyles = {
      default:
        'bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-700/70 shadow-sm dark:shadow-xl text-slate-900 dark:text-slate-100',
      glass:
        'bg-white/70 dark:bg-navy-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-navy-700/50 shadow-md dark:shadow-2xl text-slate-900 dark:text-slate-100',
      interactive:
        'bg-white dark:bg-navy-850 hover:bg-slate-50/80 dark:hover:bg-navy-800 border border-slate-200/80 dark:border-navy-700/80 hover:border-cyan-500/40 dark:hover:border-cyan-500/40 shadow-sm hover:shadow-lg dark:hover:shadow-glow-cyan/20 cursor-pointer text-slate-900 dark:text-slate-100',
      accent:
        'bg-white dark:bg-navy-900 border-t-2 border-t-cyan-500 border-x border-b border-slate-200/80 dark:border-navy-700/70 shadow-md text-slate-900 dark:text-slate-100',
      authentic:
        'bg-white dark:bg-navy-900 border-t-2 border-t-emerald-500 border-x border-b border-slate-200/80 dark:border-navy-700/70 shadow-sm text-slate-900 dark:text-slate-100',
      amber:
        'bg-white dark:bg-navy-900 border-t-2 border-t-amber-500 border-x border-b border-slate-200/80 dark:border-navy-700/70 shadow-sm text-slate-900 dark:text-slate-100',
      danger:
        'bg-white dark:bg-navy-900 border-t-2 border-t-rose-500 border-x border-b border-slate-200/80 dark:border-navy-700/70 shadow-sm text-slate-900 dark:text-slate-100',
    };

    const glowStyles = glow ? 'ring-1 ring-cyan-500/30 dark:shadow-glow-cyan' : '';

    return (
      <div
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], glowStyles, className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';

export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6 pb-3', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('text-lg font-bold tracking-tight text-slate-900 dark:text-white', className)}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-slate-600 dark:text-slate-400 leading-relaxed', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

export const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0 border-t border-slate-100 dark:border-navy-800/80 mt-4', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';
