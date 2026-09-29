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
  };
  
  /** Main content sections */
  content?: Array<{
    type: "text" | "bullet" | "custom";
    text?: string;
    emoji?: string;
    children?: ReactNode;
    className?: string;
  }>;
  
  /** Button configuration */
  buttons?: Array<{
    label: string;
    onClick: () => void;
    variant?: "primary" | "secondary" | "tertiary";
    emoji?: string;
  }>;
  
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
  footer,
  children,
  maxWidth = "max-w-md",
  contentClassName,
}: StandardModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className={`bg-white rounded-3xl shadow-2xl ${maxWidth} w-full overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh]`}>
        
        {/* Header Section - Optional Gradient Banner */}
        {header && (
          <div
            className={`${
              headerGradient
                ? `bg-gradient-to-r ${headerGradient[0]} ${headerGradient[1]}`
                : "bg-gradient-to-r from-blue-400 to-cyan-500"
            } p-[--padding-lg] flex flex-col items-center text-center`}
          >
            <div className="text-5xl mb-[--space-3]">{header.icon}</div>
            <h2 className="text-2xl font-extrabold text-white">{header.title}</h2>
            {header.subtitle && (
              <p className="text-sm text-white/90 mt-1">{header.subtitle}</p>
            )}
          </div>
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

                {item.type === "custom" && item.children && (
                  <div className={item.className}>{item.children}</div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Buttons Section */}
        {buttons.length > 0 && (
          <div className="border-t border-gray-200 p-[--padding-lg] space-y-2 flex-shrink-0">
            {buttons.length === 1 && (
              <button
                onClick={buttons[0].onClick}
                className="w-full px-[--padding-md] py-[--padding-base] rounded-full bg-gradient-to-r from-blue-400 to-cyan-500 text-white font-bold text-sm shadow-lg transition active:scale-95"
              >
                {buttons[0].emoji && <span className="mr-2">{buttons[0].emoji}</span>}
                {buttons[0].label}
              </button>
            )}

            {buttons.length === 2 && (
              <div className="grid grid-cols-2 gap-[--gap-compact]">
                <button
                  onClick={buttons[0].onClick}
                  className={`px-3 py-3 rounded-full font-bold text-xs transition active:scale-95 ${
                    buttons[0].variant === "primary"
                      ? "bg-gradient-to-r from-blue-400 to-cyan-500 text-white shadow-lg"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {buttons[0].emoji && <span className="mr-1">{buttons[0].emoji}</span>}
                  {buttons[0].label}
                </button>
                <button
                  onClick={buttons[1].onClick}
                  className={`px-3 py-3 rounded-full font-bold text-xs transition active:scale-95 ${
                    buttons[1].variant === "primary"
                      ? "bg-gradient-to-r from-blue-400 to-cyan-500 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700"
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
                    className={`w-full px-4 py-3 rounded-full font-bold text-sm transition active:scale-95 ${
                      btn.variant === "primary"
                        ? "bg-gradient-to-r from-blue-400 to-cyan-500 text-white shadow-lg"
                        : btn.variant === "secondary"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-700"
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
          <div className="bg-blue-50 px-[--padding-lg] py-[--padding-base] text-center border-t border-gray-100">
            <p className="text-xs text-muted-foreground leading-relaxed">
              {footer}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
