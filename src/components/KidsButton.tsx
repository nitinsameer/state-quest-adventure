/**
 * KidsButton - Unified button component for kids' app
 *
 * Provides consistent styling, sizing, and interactions across all screens.
 * Automatically handles fxTap() haptic feedback and accessibility.
 *
 * Variants: primary | secondary | success | locked | ghost
 * Sizes: sm (40px) | md (48px - touch target) | lg (56px)
 */

import { cn } from "@/lib/utils";
import { fxTap } from "@/lib/fx";
import React from "react";

export interface KidsButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "success" | "locked" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  ariaLabel?: string;
}

export function KidsButton({
  variant = "primary",
  size = "md",
  disabled = false,
  onClick,
  ariaLabel,
  children,
  className,
  ...props
}: KidsButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      fxTap();
      onClick?.(e);
    }
  };

  // Size mapping
  const sizeClasses = {
    sm: "h-10 px-(--padding-sm) text-xs", // 40px min height
    md: "h-12 px-(--padding-base) text-sm", // 48px min height (touch target)
    lg: "h-14 px-(--padding-md) text-base", // 56px min height
  };

  // Variant mapping
  const variantClasses = {
    primary: "ui-button ui-accent-1 text-on-primary hover:opacity-90",
    secondary: "ui-button-soft ui-accent-2 text-accent-2-ink border-2 border-border",
    success: "ui-button ui-accent-3 text-on-primary hover:opacity-90",
    locked:
      "ui-button-soft opacity-60 cursor-not-allowed text-text-disabled border-2 border-dashed",
    ghost: "bg-transparent text-accent-1 font-bold hover:bg-accent-1-soft active:scale-95",
  };

  return (
    <button
      {...props}
      onClick={handleClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(
        "rounded-full font-display focus:outline-2 focus:outline-offset-2 focus:outline-accent-1",
        "transition-all duration-200 flex items-center justify-center gap-2",
        "active:scale-95 disabled:cursor-not-allowed",
        sizeClasses[size],
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </button>
  );
}
