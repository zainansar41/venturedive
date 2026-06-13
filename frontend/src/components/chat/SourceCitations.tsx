import { useState } from "react";
import type { ChatSource } from "../../types";

interface SourceCitationsProps {
  sources: ChatSource[];
}

export function SourceCitations({ sources }: SourceCitationsProps) {
  const [expanded, setExpanded] = useState(false);

  if (sources.length === 0) return null;

  return (
    <div className="mt-3 border-t border-border pt-3">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="focus-ring flex items-center gap-2 rounded-md text-xs font-medium text-text-muted transition hover:text-text"
        aria-expanded={expanded}
      >
        <svg
          className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-90" : ""}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
            clipRule="evenodd"
          />
        </svg>
        {sources.length} source{sources.length === 1 ? "" : "s"}
      </button>

      {expanded && (
        <div className="mt-3 space-y-3">
          {sources.map((source, index) => (
            <div key={`${source.sectionTitle}-${index}`} className="rounded-lg bg-bg/60 p-3">
              <span className="label-tag mb-1.5">{source.sectionTitle}</span>
              <p className="text-xs leading-5 text-text-muted">{source.snippet}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
