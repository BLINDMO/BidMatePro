/**
 * SplashScreen — the main logo opening screen.
 *
 * Shows the BidMate Pro brand mark while the app boots, with a small
 * copyright footer pinned to the bottom (above the iOS safe-area inset).
 */
export default function SplashScreen() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-bg px-5">
      {/* Logo / brand mark — amber chevron tile matching the app icon */}
      <div className="flex flex-col items-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-[28px] bg-amber shadow-lg shadow-amber/20">
          <svg width="52" height="52" viewBox="0 0 52 52" fill="none" aria-label="BidMate Pro">
            <path
              d="M8 34 L26 18 L44 34 L37 34 L26 25 L15 34 Z"
              fill="#090C15"
            />
          </svg>
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
