/**
 * SplashScreen — brand opening screen shown while the app boots.
 * Presents the Honeycutt Construction wordmark on a clean panel, with a
 * copyright footer pinned above the iOS safe-area inset.
 */
export default function SplashScreen() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-bg px-8">
      {/* subtle radial glow behind the mark */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-[60%] rounded-full bg-amber/10 blur-3xl" />

      <div className="relative flex w-full max-w-[300px] flex-col items-center">
        <div className="flex w-full items-center justify-center rounded-3xl bg-white px-7 py-8 shadow-pop">
          <img
            src={`${import.meta.env.BASE_URL}brand/honeycutt-logo.png`}
            alt="Honeycutt Construction"
            className="h-16 w-auto object-contain"
          />
        </div>
        <p className="mt-6 text-sm font-medium tracking-wide text-ink-2">
          Bidding &amp; Job Management
        </p>
      </div>

      <footer className="safe-bottom absolute inset-x-0 bottom-0 pb-6 text-center">
        <p className="text-2xs font-medium tracking-wide text-ink-3">© Jon Honeycutt, 2026</p>
      </footer>
    </div>
  );
}
