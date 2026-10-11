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

export interface StandardModalProps {
  /** Whether modal is open */
  open?: boolean;
  
  /** Called when modal should close */
  onClose?: () => void;
  
  /** Gradient colors for header: [from, to] */
  headerGradient?: [string, string];
  
  /** Header content (icon + title) */
  header?: {
    icon: ReactNode;
    title: string;
    subtitle?: string;
    closeButton?: boolean;
    onClose?: () => void;
    floatingIcon?: boolean;  // NEW: Enable floating icon mode
    floatingIconGradient?: [string, string];  // NEW: Custom gradient for floating icon
  };
  
  /** Main content sections */
  content?: Array<{
    type: "text" | "bullet" | "custom" | "badgeGrid";  // NEW: Add badgeGrid
    text?: string;
    emoji?: string;
    children?: ReactNode;
    className?: string;
    badges?: Array<{ emoji: string; label: string }>;  // NEW: for badgeGrid
  }>;
  
  /** Button configuration */
  buttons?: Array<{
    label: string;
    onClick: () => void;
    variant?: "primary" | "secondary" | "tertiary" | "ghost";  // NEW: Add ghost
    emoji?: string;
    customClass?: string;  // NEW: Override default classes
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
  headerGradient,
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
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className={`bg-white rounded-3xl shadow-2xl ${maxWidth} w-full ${header?.floatingIcon ? '' : 'overflow-hidden'} animate-in zoom-in-95 flex flex-col max-h-[90vh] relative`}>
        
        {/* Header Section - Optional Gradient Banner or Floating Icon */}
        {header && (
          <>
            {header.floatingIcon ? (
              // Floating Icon Mode - icon hovers above card
              <>
                <div className={`absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full flex items-center justify-center text-4xl shadow-2xl border-4 border-white z-20 ${
                  header.floatingIconGradient
                    ? `bg-gradient-to-br ${header.floatingIconGradient[0]} ${header.floatingIconGradient[1]}`
                    : "bg-gradient-to-br from-blue-400 to-cyan-500"
                }`}>
                  <span className="animate-pulse">{header.icon}</span>
                </div>
                <div className="px-[--padding-lg] pt-14 pb-4 flex flex-col items-center text-center">
                  {header.closeButton && (
                    <button
                      onClick={header.onClose}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center text-lg transition-all duration-200 z-10"
                      aria-label="Close"
                    >
                      ✕
                    </button>
                  )}
                  <h2 className="text-2xl font-extrabold text-ink">{header.title}</h2>
                  {header.subtitle && <p className="text-sm text-muted-foreground mt-1">{header.subtitle}</p>}
                </div>
              </>
            ) : (
              // Gradient Banner Mode (existing)
              <div
                className={`${
                  headerGradient
                    ? `bg-gradient-to-r ${headerGradient[0]} ${headerGradient[1]}`
                    : "bg-gradient-to-r from-blue-400 to-cyan-500"
                } p-[--padding-lg] flex flex-col items-center text-center relative`}
              >
                {header.closeButton && (
                  <button
                    onClick={header.onClose}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/30 hover:bg-white/50 text-white flex items-center justify-center text-lg transition-all duration-200 z-10"
                    aria-label="Close"
                  >
                    ✕
                  </button>
                )}
                <div className="text-5xl mb-[--space-3]">{header.icon}</div>
                <h2 className="text-2xl font-extrabold text-white">{header.title}</h2>
                {header.subtitle && (
                  <p className="text-sm text-white/90 mt-1">{header.subtitle}</p>
                )}
              </div>
            )}
          </>
        )}

        {/* Content Area */}
        <div className={`flex-1 overflow-y-auto p-[--padding-lg] space-y-[--gap-base] ${contentClassName}`}>
          {children ? (
            children
          ) : (
            content?.map((item, idx) => (
              <div key={idx}>
                {item.type === "text" && (
                  <p className={`text-sm text-ink/80 leading-relaxed ${item.className}`}>
                    {item.emoji && <span className="mr-2">{item.emoji}</span>}
                    {item.text}
                  </p>
                )}

                {item.type === "bullet" && (
                  <div className={`flex items-start gap-[--gap-compact] ${item.className}`}>
                    <span className="text-lg flex-shrink-0 mt-0.5">{item.emoji || "•"}</span>
                    <p className="text-sm text-ink/80 leading-relaxed pt-0.5">{item.text}</p>
                  </div>
                )}

                {item.type === "badgeGrid" && item.badges && (
                  <div className={`flex flex-wrap gap-2 justify-center ${item.className}`}>
                    {item.badges.map((badge, badgeIdx) => (
                      <div
                        key={badgeIdx}
                        className="flex items-center gap-1.5 bg-white/80 border border-black/5 rounded-full px-3 py-1.5 text-sm font-bold shadow-sm"
                      >
                        <span className="text-base">{badge.emoji}</span>
                        <span>{badge.label}</span>
                      </div>
                    ))}
                  </div>
                )}

                {item.type === "custom" && item.children && (
                  <div className={item.className}>{item.children}</div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Buttons Section */}
        {buttons.length > 0 && (
          <div className="border-t border-muted p-[--padding-lg] flex-shrink-0">
            {buttons.length === 1 && (
              <div className="space-y-2">
                <button
                  onClick={buttons[0].onClick}
                  className={buttons[0].customClass || `w-full px-[--padding-md] py-[--padding-base] rounded-full font-bold text-sm shadow-lg transition active:scale-95 ${
                    buttons[0].variant === "primary" || !buttons[0].variant
                      ? "bg-gradient-to-r from-blue-400 to-cyan-500 text-white"
                      : buttons[0].variant === "ghost"
                        ? "bg-transparent border-2 border-blue-400 text-blue-600 hover:bg-blue-50"
                        : "bg-blue-100 text-blue-700"
                  }`}
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
                  className={buttons[0].customClass || `w-full px-4 py-3 rounded-full font-bold text-sm transition active:scale-95 ${
                    buttons[0].variant === "primary"
                      ? "bg-gradient-to-r from-blue-400 to-cyan-500 text-white shadow-lg"
                      : buttons[0].variant === "ghost"
                        ? "bg-transparent border-2 border-current text-gray-600 hover:bg-gray-50"
                        : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {buttons[0].emoji && <span className="mr-2">{buttons[0].emoji}</span>}
                  {buttons[0].label}
                </button>
                <button
                  onClick={buttons[1].onClick}
                  className={buttons[1].customClass || `w-full px-4 py-3 rounded-full font-bold text-sm transition active:scale-95 ${
                    buttons[1].variant === "primary"
                      ? "bg-gradient-to-r from-blue-400 to-cyan-500 text-white shadow-lg"
                      : buttons[1].variant === "ghost"
                        ? "bg-transparent border-2 border-current text-gray-600 hover:bg-gray-50"
                        : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {buttons[1].emoji && <span className="mr-2">{buttons[1].emoji}</span>}
                  {buttons[1].label}
                </button>
              </div>
            )}

            {buttons.length === 2 && buttonsLayout !== "stack" && (
              <div className="grid grid-cols-2 gap-[--gap-compact]">
                <button
                  onClick={buttons[0].onClick}
                  className={buttons[0].customClass || `px-3 py-3 rounded-full font-bold text-xs transition active:scale-95 ${
                    buttons[0].variant === "primary"
                      ? "bg-gradient-to-r from-blue-400 to-cyan-500 text-white shadow-lg"
                      : buttons[0].variant === "ghost"
                        ? "bg-transparent border-2 border-current text-gray-600 hover:bg-gray-50"
                        : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {buttons[0].emoji && <span className="mr-1">{buttons[0].emoji}</span>}
                  {buttons[0].label}
                </button>
                <button
                  onClick={buttons[1].onClick}
                  className={buttons[1].customClass || `px-3 py-3 rounded-full font-bold text-xs transition active:scale-95 ${
                    buttons[1].variant === "primary"
                      ? "bg-gradient-to-r from-blue-400 to-cyan-500 text-white shadow-lg"
                      : buttons[1].variant === "ghost"
                        ? "bg-transparent border-2 border-current text-gray-600 hover:bg-gray-50"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {buttons[1].emoji && <span className="mr-1">{buttons[1].emoji}</span>}
                  {buttons[1].label}
                </button>
              </div>
            )}

            {buttons.length > 2 && (
              <div className="space-y-[--gap-compact]">
                {buttons.map((btn, idx) => (
                  <button
                    key={idx}
                    onClick={btn.onClick}
                    className={btn.customClass || `w-full px-4 py-3 rounded-full font-bold text-sm transition active:scale-95 ${
                      btn.variant === "primary"
                        ? "bg-gradient-to-r from-blue-400 to-cyan-500 text-white shadow-lg"
                        : btn.variant === "secondary"
                          ? "bg-blue-100 text-blue-700"
                          : btn.variant === "ghost"
                            ? "bg-transparent border-2 border-current text-gray-600 hover:bg-gray-50"
                            : "bg-muted text-muted-foreground"
                    }`}
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
          <div className="bg-info-soft px-[--padding-lg] py-[--padding-base] text-center border-t border-muted-light">
            <p className="text-xs text-muted-foreground leading-relaxed">
              {footer}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

