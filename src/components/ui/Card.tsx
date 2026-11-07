import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../../utils/helpers';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', padding = 'md', hover = false, children, ...props }, ref) => {
    const variantClasses = {
      default: 'card',
      elevated: 'card-elevated',
      outlined: 'border border-slate-200 bg-white'
    };

    const paddingClasses = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
      xl: 'p-10'
    };

    const hoverClasses = hover ? 'hover:shadow-lg hover:border-slate-300 transition-all duration-300' : '';

    return (
      <div
        ref={ref}
        className={cn(variantClasses[variant], paddingClasses[padding], hoverClasses, className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export { Card };