import { useNavigate } from "@tanstack/react-router";
import { fxTap } from "@/lib/fx";
import { EMOJI } from "@/constants/emoji";

interface LockedPostcardModalProps {
  destination: string;
  onClose: () => void;
}

/**
 * Modal shown when user taps a locked postcard
 * Displays lock message and offers to navigate to Journey screen for that state
 */
export function LockedPostcardModal({ destination, onClose }: LockedPostcardModalProps) {
  const navigate = useNavigate();

  const handleExplore = () => {
    fxTap();
    navigate({
      to: "/journey",
      search: { state: destination },
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-end z-50 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full bg-white rounded-t-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🔒</div>
          <h2 className="text-2xl font-extrabold text-ink">Postcard Locked</h2>
        </div>

        {/* Message */}
        <div className="text-center mb-8">
          <p className="text-base text-muted-dark leading-relaxed">
            Complete <span className="font-extrabold">{destination}</span>'s journey to collect this
            postcard!
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 flex-col">
          <button
            onClick={handleExplore}
            className="w-full py-3 px-4 rounded-xl font-extrabold text-white bg-accent-1 shadow-lg hover:shadow-xl transition-all active:scale-95"
          >
            {EMOJI.nav.map} Explore State
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 px-4 rounded-xl font-extrabold text-muted-dark bg-muted hover:bg-muted transition-colors active:scale-95"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
