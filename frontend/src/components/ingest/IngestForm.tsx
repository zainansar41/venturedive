import type { FormEvent } from "react";
import { Spinner } from "../ui/Spinner";

interface IngestFormProps {
  url: string;
  loadingIngest: boolean;
  onUrlChange: (url: string) => void;
  onSubmit: (event: FormEvent) => void;
}

export function IngestForm({ url, loadingIngest, onUrlChange, onSubmit }: IngestFormProps) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div>
        <span className="label-tag mb-3">Ingest</span>
        <p className="mt-3 text-sm leading-6 text-text-muted">
          Paste a Wikipedia URL to scrape, summarize, and index the article for grounded chat.
        </p>
      </div>
      <div>
        <label htmlFor="wiki-url" className="mb-2 block text-xs font-semibold uppercase tracking-widest text-text-muted">
          Article URL
        </label>
        <input
          id="wiki-url"
          type="url"
          value={url}
          onChange={(event) => onUrlChange(event.target.value)}
          placeholder="https://en.wikipedia.org/wiki/Node.js"
          className="input-field focus-ring"
          required
          disabled={loadingIngest}
        />
      </div>
      <button type="submit" disabled={loadingIngest} className="btn-primary focus-ring w-full">
        {loadingIngest ? (
          <>
            <Spinner />
            Ingesting…
          </>
        ) : (
          "Ingest Article"
        )}
      </button>
    </form>
  );
}
