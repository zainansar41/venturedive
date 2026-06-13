import { BrandLogo } from "../ui/BrandLogo";

interface HeaderProps {
  sessionId: string;
  onResetSession: () => void;
}

export function Header({ sessionId, onResetSession }: HeaderProps) {
  return (
    <header className="app-header shrink-0 px-4 py-4 md:px-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BrandLogo className="h-8 w-8 shrink-0 text-accent" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-text md:text-lg">
                Wikipedia RAG Chat
              </h1>
              <span className="label-tag hidden sm:inline">RAG Demo</span>
            </div>
            <p className="mt-0.5 hidden max-w-lg text-xs text-text-muted sm:block">
              Grounded AI chat over Wikipedia articles — inspired by VentureDive engineering.
            </p>
          </div>
        </div>

        {sessionId ? (
          <button
            type="button"
            onClick={onResetSession}
            className="btn-ghost focus-ring shrink-0 text-xs"
          >
            New Session
          </button>
        ) : (
          <a
            href="https://www.venturedive.com/apac"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary focus-ring hidden shrink-0 text-xs sm:inline-flex"
          >
            VentureDive
          </a>
        )}
      </div>
    </header>
  );
}
