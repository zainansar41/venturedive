export function TypingIndicator() {
  return (
    <div className="mr-auto max-w-[92%]">
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-text-muted">
        Assistant
      </p>
      <div className="surface-card-raised inline-flex items-center gap-1.5 px-4 py-3">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
  );
}
