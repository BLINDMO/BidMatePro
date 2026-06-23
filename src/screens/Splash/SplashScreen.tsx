/**
 * SplashScreen — the main logo opening screen.
 *
 * Shows the BidMate Pro brand mark while the app boots, with a small
 * copyright footer pinned to the bottom (above the iOS safe-area inset).
 */
export default function SplashScreen() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-bg px-5">
      {/* Logo / brand mark */}
      <div className="flex flex-col items-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-amber-dim ring-1 ring-amber/30">
          <span className="text-5xl" role="img" aria-label="BidMate Pro">
            🔨
          </span>
        </div>
        <h1 className="mt-6 text-3xl font-black tracking-tight text-ink-1">BidMate Pro</h1>
        <p className="mt-2 text-sm text-ink-2">Construction Bidding &amp; Job Management</p>
      </div>

      {/* Copyright footer */}
      <footer className="safe-bottom absolute inset-x-0 bottom-0 pb-5 text-center">
        <p className="text-xs font-medium text-ink-3">© Jon Honeycutt, 2026</p>
      </footer>
    </div>
  );
}
