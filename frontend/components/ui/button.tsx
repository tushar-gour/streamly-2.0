import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cloneElement, isValidElement } from "react";
import type { ButtonHTMLAttributes, ReactElement, ReactNode } from "react";

import { cn } from "@/lib/utils/class-name";

const buttonVariants = cva(
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-input px-4 text-sm font-medium transition-all duration-180 ease-streamly focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-indigo text-white shadow-[0_12px_30px_rgba(108,92,231,0.28)] hover:bg-[#7C70F2] active:bg-[#5A4BD5]",
        secondary:
          "border border-[color:var(--color-border)] bg-[rgba(24,29,43,0.72)] text-[color:var(--color-text-primary)] hover:border-[rgba(141,132,255,0.48)]",
        ghost:
          "text-[color:var(--color-text-secondary)] hover:bg-[rgba(24,29,43,0.72)] hover:text-[color:var(--color-text-primary)]",
        danger:
          "bg-[#FF6B6B] text-[#16090B] hover:bg-[#ff8585] active:bg-[#e85c5c]",
      },
      size: {
        sm: "min-h-9 px-3 text-sm",
        md: "min-h-11 px-4",
        lg: "min-h-14 px-6 text-base",
        icon: "size-11 px-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    children: ReactNode;
    href?: string;
    isLoading?: boolean;
  };

export function Button({
  asChild = false,
  children,
  className,
  disabled,
  href,
  isLoading,
  size,
  variant,
  ...props
}: ButtonProps) {
  const classes = cn(buttonVariants({ variant, size }), className);

  if (asChild && href) {
    return (
      <Link className={classes} href={href}>
        {children}
      </Link>
    );
  }

  if (asChild) {
    if (isValidElement(children)) {
      const child = children as ReactElement<{ className?: string }>;
      return cloneElement(child, {
        className: cn(classes, child.props.className),
      });
    }

    return <span className={classes}>{children}</span>;
  }

  return (
    <button className={classes} disabled={disabled || isLoading} {...props}>
      {isLoading ? "Loading..." : children}
    </button>
  );
}
