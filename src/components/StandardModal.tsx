/**
 * StandardModal - Reusable modal component for all dialogs and popups
 *
 * Features:
 * - Consistent white card design with rounded corners
 * - Optional gradient header section (top banner with icon/title)
 * - Organized content area with bullet points/items
 * - Flexible button layout (1, 2, or more buttons)
 * - Proper backdrop with 50% opacity and blur
 * - Kid-friendly animations
 */

import React, { ReactNode } from "react";
import { EMOJI } from "@/constants/emoji";

export interface StandardModalProps {
  /** Whether modal is open */
  open?: boolean;

  /** Called when modal should close */
  onClose?: () => void;

  /** Header content (icon + title) */
  header?: {
    icon: ReactNode;
    title: string;
    subtitle?: string;
    closeButton?: boolean;
    onClose?: () => void;
    floatingIcon?: boolean; // Enable floating icon mode (uses bg-header token)
  };

  /** Main content sections */
  content?: Array<{
    type: "text" | "bullet" | "custom" | "badgeGrid"; // NEW: Add badgeGrid
    text?: string;
    emoji?: string;
    children?: ReactNode;
    className?: string;
    badges?: Array<{ emoji: string; label: string }>; // NEW: for badgeGrid
  }>;

  /** Button configuration */
  buttons?: Array<{
    label: string;
    onClick: () => void;
    variant?: "primary" | "secondary" | "tertiary" | "ghost"; // NEW: Add ghost
    emoji?: string;
    customClass?: string; // NEW: Override default classes
  }>;

  /** Button layout: "grid" (default, 2 cols) or "stack" (full-width stacked) */
  buttonsLayout?: "grid" | "stack";

  /** Footer note (small text at bottom) */
  footer?: string;

  /** Custom children override content prop */
  children?: ReactNode;

  /** Max width of modal */
  maxWidth?: string;

  /** Custom className for content area */
  contentClassName?: string;
}

export function StandardModal({
  open = true,
  onClose,
  header,
  content,
  buttons = [],
  buttonsLayout = "grid",
  footer,
  children,
  maxWidth = "max-w-md",
  contentClassName,
}: StandardModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 ui-scrim flex items-center justify-center p-4 animate-in fade-in">
      <div
        className={`rounded-[var(--radius-modal)] shadow-[var(--shadow-raised)] bg-surface-card ${maxWidth} w-full ${header?.floatingIcon ? "" : "overflow-hidden"} animate-in zoom-in-95 flex flex-col max-h-[90vh] relative`}
      >
        {/* Header Section - Optional Gradient Banner or Floating Icon */}
        {header && (
          <>
            {header.floatingIcon ? (
              // Floating Icon Mode - icon hovers above card
              <>
                <div
                  className={`absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full flex items-center justify-center text-4xl shadow-[var(--shadow-raised)] border-4 border-surface-card z-20 bg-header`}
                >
                  <span className="animate-pulse">{header.icon}</span>
                </div>
                <div className="bg-surface-card px-(--padding-lg) pt-14 pb-4 flex flex-col items-center text-center">
                  {header.closeButton && (
                    <button
                      onClick={header.onClose}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full ui-button-soft flex items-center justify-center text-lg transition-all duration-200 z-10"
                      aria-label="Close"
                    >
                      {EMOJI.ui.close}
                    </button>
                  )}
                  <h2 className="text-2xl font-extrabold" style={{ color: "var(--ink)" }}>
                    {header.title}
                  </h2>
                  {header.subtitle && (
                    <p className="text-sm text-muted-foreground mt-1">{header.subtitle}</p>
                  )}
                </div>
              </>
            ) : (
              // Gradient Banner Mode (existing)
              <div
                className={`bg-header p-(--padding-lg) flex flex-col items-center text-center relative`}
              >
                {header.closeButton && (
                  <button
                    onClick={header.onClose}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full ui-button-soft flex items-center justify-center text-lg transition-all duration-200 z-10"
                    aria-label="Close"
                  >
                    {EMOJI.ui.close}
                  </button>
                )}
                <div className="text-5xl mb-(--space-3)">{header.icon}</div>
                <h2 className="text-2xl font-extrabold" style={{ color: "var(--text-on-header)" }}>
                  {header.title}
                </h2>
                {header.subtitle && (
                  <p className="text-sm mt-1" style={{ color: "var(--text-on-header)" }}>
                    {header.subtitle}
                  </p>
                )}
              </div>
            )}
          </>
        )}

        {/* Content Area */}
        <div
          className={`flex-1 overflow-y-auto p-(--padding-lg) space-y-(--gap-base) ${contentClassName}`}
        >
          {children
            ? children
            : content?.map((item, idx) => (
                <div key={idx}>
                  {item.type === "text" && (
                    <p
                      className={`text-sm leading-relaxed ${item.className}`}
                      style={{ color: "var(--text-primary)" }}
                    >
                      {item.emoji && <span className="mr-2">{item.emoji}</span>}
                      {item.text}
                    </p>
                  )}

                  {item.type === "bullet" && (
                    <div className={`flex items-start gap-(--gap-compact) ${item.className}`}>
                      <span className="text-lg flex-shrink-0 mt-0.5">{item.emoji || "•"}</span>
                      <p
                        className="text-sm leading-relaxed pt-0.5"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {item.text}
                      </p>
                    </div>
                  )}

                  {item.type === "badgeGrid" && item.badges && (
                    <div className={`flex flex-wrap gap-2 justify-center ${item.className}`}>
                      {item.badges.map((badge, badgeIdx) => (
                        <div
                          key={badgeIdx}
                          className="flex items-center gap-1.5 bg-surface-card border border-border-subtle rounded-full px-3 py-1.5 text-sm font-bold shadow-sm"
                        >
                          <span className="text-base">{badge.emoji}</span>
                          <span style={{ color: "var(--text-primary)" }}>{badge.label}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {item.type === "custom" && item.children && (
                    <div className={item.className}>{item.children}</div>
                  )}
                </div>
              ))}
        </div>

        {/* Buttons Section */}
        {buttons.length > 0 && (
          <div className="border-t border-[var(--border-color)] p-(--padding-lg) flex-shrink-0">
            {buttons.length === 1 && (
              <div className="space-y-2">
                <button
                  onClick={buttons[0].onClick}
                  className={
                    buttons[0].customClass ||
                    `w-full px-(--padding-md) py-(--padding-base) rounded-full font-bold text-sm transition active:scale-95 ${
                      buttons[0].variant === "primary" || !buttons[0].variant
                        ? "ui-button"
                        : buttons[0].variant === "ghost"
                          ? "ui-button-soft border-2"
                          : "ui-button-soft"
                    }`
                  }
                >
                  {buttons[0].emoji && <span className="mr-2">{buttons[0].emoji}</span>}
                  {buttons[0].label}
                </button>
              </div>
            )}

            {buttons.length === 2 && buttonsLayout === "stack" && (
              <div className="space-y-2">
                <button
                  onClick={buttons[0].onClick}
                  className={
                    buttons[0].customClass ||
                    `w-full px-4 py-3 rounded-full font-bold text-sm transition active:scale-95 ${
                      buttons[0].variant === "primary"
                        ? "ui-button"
                        : buttons[0].variant === "ghost"
                          ? "ui-button-soft border-2"
                          : "ui-button-soft"
                    }`
                  }
                >
                  {buttons[0].emoji && <span className="mr-2">{buttons[0].emoji}</span>}
                  {buttons[0].label}
                </button>
                <button
                  onClick={buttons[1].onClick}
                  className={
                    buttons[1].customClass ||
                    `w-full px-4 py-3 rounded-full font-bold text-sm transition active:scale-95 ${
                      buttons[1].variant === "primary"
                        ? "ui-button"
                        : buttons[1].variant === "ghost"
                          ? "ui-button-soft border-2"
                          : "ui-button-soft"
                    }`
                  }
                >
                  {buttons[1].emoji && <span className="mr-2">{buttons[1].emoji}</span>}
                  {buttons[1].label}
                </button>
              </div>
            )}

            {buttons.length === 2 && buttonsLayout !== "stack" && (
              <div className="grid grid-cols-2 gap-(--gap-compact)">
                <button
                  onClick={buttons[0].onClick}
                  className={
                    buttons[0].customClass ||
                    `px-3 py-3 rounded-full font-bold text-xs transition active:scale-95 ${
                      buttons[0].variant === "primary"
                        ? "ui-button"
                        : buttons[0].variant === "ghost"
                          ? "ui-button-soft border-2"
                          : "ui-button-soft"
                    }`
                  }
                >
                  {buttons[0].emoji && <span className="mr-1">{buttons[0].emoji}</span>}
                  {buttons[0].label}
                </button>
                <button
                  onClick={buttons[1].onClick}
                  className={
                    buttons[1].customClass ||
                    `px-3 py-3 rounded-full font-bold text-xs transition active:scale-95 ${
                      buttons[1].variant === "primary"
                        ? "ui-button"
                        : buttons[1].variant === "ghost"
                          ? "ui-button-soft border-2"
                          : "ui-button-soft"
                    }`
                  }
                >
                  {buttons[1].emoji && <span className="mr-1">{buttons[1].emoji}</span>}
                  {buttons[1].label}
                </button>
              </div>
            )}

            {buttons.length > 2 && (
              <div className="space-y-(--gap-compact)">
                {buttons.map((btn, idx) => (
                  <button
                    key={idx}
                    onClick={btn.onClick}
                    className={
                      btn.customClass ||
                      `w-full px-4 py-3 rounded-full font-bold text-sm transition active:scale-95 ${
                        btn.variant === "primary"
                          ? "ui-button"
                          : btn.variant === "secondary"
                            ? "ui-button-soft"
                            : btn.variant === "ghost"
                              ? "ui-button-soft border-2"
                              : "ui-button-soft"
                      }`
                    }
                  >
                    {btn.emoji && <span className="mr-2">{btn.emoji}</span>}
                    {btn.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer Note */}
        {footer && (
          <div className="bg-[var(--surface-subtle)] px-(--padding-lg) py-(--padding-base) text-center border-t border-[var(--border-default)]">
            <p className="text-xs text-muted-foreground leading-relaxed">{footer}</p>
          </div>
        )}
      </div>
    </div>
  );
}
