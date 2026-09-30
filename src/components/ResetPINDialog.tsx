import { useState, useEffect } from "react";
import { fxTap, fxWrong } from "@/lib/fx";

interface ResetPINDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const DEFAULT_PIN = "1234";

/**
 * Parental PIN Dialog for Reset Confirmation
 * - Shows PIN entry keypad
 * - 4-digit PIN (default: 1234, or custom if set in ParentZone)
 * - 30-second timeout with countdown
 * - Prevents accidental data loss
 */
export function ResetPINDialog({ open, onConfirm, onCancel }: ResetPINDialogProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(30);
  const [isValid, setIsValid] = useState(false);
  const [correctPin, setCorrectPin] = useState(DEFAULT_PIN);

  // Load saved PIN on dialog open
  useEffect(() => {
    if (open && typeof window !== "undefined") {
      const savedPin = localStorage.getItem("india-explorer:parent-pin:v1");
      if (savedPin && savedPin.length === 4) {
        setCorrectPin(savedPin);
      } else {
        setCorrectPin(DEFAULT_PIN);
      }
    }
  }, [open]);

  // Countdown timer
  useEffect(() => {
    if (!open) return;
    
    setPin("");
    setError("");
    setTimeLeft(30);
    setIsValid(false);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onCancel(); // Auto-close on timeout
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [open, onCancel]);

  const handleKeyPress = (digit: string) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      fxTap();

      // Check on 4th digit
      if (newPin.length === 4) {
        if (newPin === correctPin) {
          setIsValid(true);
          setError("");
          // Auto-confirm after 500ms
          setTimeout(() => {
            onConfirm();
          }, 500);
        } else {
          setError("❌ Incorrect PIN");
          fxWrong();
          setPin("");
          setTimeout(() => setError(""), 2000);
        }
      }
    }
  };

  const handleBackspace = () => {
    fxTap();
    setPin(pin.slice(0, -1));
    setError("");
  };

  const handleClear = () => {
    fxTap();
    setPin("");
    setError("");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-6 w-[90%] max-w-sm shadow-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🔐</div>
          <h2 className="text-display text-xl font-extrabold text-ink">Parent PIN Required</h2>
          <p className="text-sm text-muted-foreground mt-2">
            This will erase all progress. Enter the parental PIN to confirm.
          </p>
        </div>

        {/* Timer */}
        <div className="text-center mb-4">
          <div className="text-xs font-bold text-muted-foreground">
            ⏱️ {timeLeft}s remaining
          </div>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mt-1">
            <div
              className="h-full bg-gradient-to-r from-red-400 to-red-600 transition-all"
              style={{ width: `${(timeLeft / 30) * 100}%` }}
            />
          </div>
        </div>

        {/* PIN Input Display */}
        <div className="bg-gray-100 rounded-2xl p-4 mb-4">
          <div className="flex justify-center gap-2">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-12 w-12 rounded-lg flex items-center justify-center font-extrabold text-lg transition ${
                  i < pin.length
                    ? "bg-gradient-to-br from-blue-400 to-blue-600 text-white"
                    : "bg-white border-2 border-gray-300 text-gray-400"
                }`}
              >
                {i < pin.length ? "●" : "○"}
              </div>
            ))}
          </div>
          {error && (
            <div className="text-center text-sm font-bold text-red-600 mt-3">
              {error}
            </div>
          )}
          {isValid && (
            <div className="text-center text-sm font-bold text-green-600 mt-3">
              ✓ PIN correct, resetting...
            </div>
          )}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
            <button
              key={digit}
              onClick={() => handleKeyPress(String(digit))}
              disabled={isValid}
              className="h-12 rounded-xl bg-white border-2 border-gray-300 text-display text-lg font-extrabold hover:bg-gray-100 active:scale-95 transition disabled:opacity-50"
            >
              {digit}
            </button>
          ))}
          <button
            onClick={() => handleKeyPress("0")}
            disabled={isValid}
            className="col-span-3 h-12 rounded-xl bg-white border-2 border-gray-300 text-display text-lg font-extrabold hover:bg-gray-100 active:scale-95 transition disabled:opacity-50"
          >
            0
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleBackspace}
            disabled={isValid}
            className="flex-1 h-10 rounded-lg bg-orange-50 text-orange-600 font-extrabold text-sm hover:bg-orange-100 active:scale-95 transition disabled:opacity-50"
          >
            ← Back
          </button>
          <button
            onClick={handleClear}
            disabled={isValid || pin.length === 0}
            className="flex-1 h-10 rounded-lg bg-red-50 text-red-600 font-extrabold text-sm hover:bg-red-100 active:scale-95 transition disabled:opacity-50"
          >
            Clear
          </button>
        </div>

        {/* Cancel Button */}
        <button
          onClick={onCancel}
          disabled={isValid}
          className="w-full h-10 rounded-lg bg-gray-100 text-gray-700 font-extrabold text-sm hover:bg-gray-200 active:scale-95 transition mt-3 disabled:opacity-50"
        >
          Cancel
        </button>

        {/* PIN Info */}
        <div className="text-xs text-muted-foreground text-center mt-4 p-3 bg-blue-50 rounded-lg">
          <span>💡 Default PIN: 1234</span>
          <br />
          <span>Change in Parent Zone (Profile)</span>
        </div>
      </div>
    </div>
  );
}
