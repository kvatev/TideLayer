import {
  forwardRef,
  cloneElement,
  isValidElement,
  type ButtonHTMLAttributes,
  type ReactElement,
} from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { cn } from '../../utils/helpers';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  /** When true, renders the first child element as the root (Slot pattern) */
  asChild?: boolean;
}

export interface LinkButtonProps {
  variant?: Variant;
  size?: Size;
  href?: string;
  to?: string;
  className?: string;
  children?: React.ReactNode;
  target?: string;
  rel?: string;
  onClick?: () => void;
}

function buttonClasses(variant: Variant = 'primary', size: Size = 'md', extra?: string) {
  return cn('btn', `btn-${variant}`, size !== 'md' ? `btn-${size}` : '', extra);
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, asChild, ...props }, ref) => {
    const classes = buttonClasses(variant, size, className);

    if (asChild && isValidElement(children)) {
      return cloneElement(children as ReactElement<{ className?: string }>, {
        className: cn(classes, (children as ReactElement<{ className?: string }>).props.className),
      });
    }

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

/** A router-aware link styled as a button */
export const LinkButton = forwardRef<HTMLAnchorElement, LinkButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, to, href, ...props }, ref) => {
    const classes = buttonClasses(variant, size, className);

    if (to) {
      return (
        <Link to={to} className={classes} {...(props as Omit<LinkProps, 'to'>)}>
          {children}
        </Link>
      );
    }

    return (
      <a ref={ref} href={href} className={classes} {...props}>
        {children}
      </a>
    );
  }
);

LinkButton.displayName = 'LinkButton';

export default Button;
