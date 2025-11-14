export function AuthModal({
  isOpen,
  onClose,
  onGoogleSignIn,
}: {
  isOpen: boolean;
  onClose: () => void;
  onGoogleSignIn: () => Promise<void>;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-[#1a0f11]/95 border border-black/60 rounded-2xl p-6 max-w-md w-full shadow-lg dex-rim">
        <h2 className="text-xl font-semibold mb-2">Sign in</h2>
        <p className="text-sm text-rose-200/80 mb-4">Use your Google account to save your ratings across devices.</p>

        <button
          onClick={onGoogleSignIn}
          className="btn btn-primary btn-pill w-full"
          aria-label="Sign in with Google"
        >
          <span aria-hidden>🟡</span>
          <span>Continue with Google</span>
        </button>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-rose-200/80 hover:text-rose-100"
          aria-label="Close sign in modal"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
