interface ArticleSummaryProps {
  title: string;
  summary: string;
  loading: boolean;
  justLoaded: boolean;
}

export function ArticleSummary({ title, summary, loading, justLoaded }: ArticleSummaryProps) {
  if (loading) {
    return (
      <div className="surface-card p-5">
        <span className="label-tag mb-4">Summary</span>
        <div className="mt-4 space-y-3">
          <div className="skeleton-bar w-3/4" />
          <div className="skeleton-bar w-full" />
          <div className="skeleton-bar w-full" />
          <div className="skeleton-bar w-5/6" />
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="surface-card p-5">
        <span className="label-tag mb-3">Summary</span>
        <p className="mt-3 text-sm leading-6 text-text-muted">
          Ingest an article to see its AI-generated summary here.
        </p>
      </div>
    );
  }

  return (
    <div className={`surface-card p-5 ${justLoaded ? "summary-glow-in" : ""}`}>
      <span className="label-tag mb-3">Summary</span>
      <h2 className="mb-3 mt-3 text-lg font-bold leading-snug text-text">{title}</h2>
      <p className="whitespace-pre-wrap text-sm leading-7 text-text-muted">{summary}</p>
    </div>
  );
}
