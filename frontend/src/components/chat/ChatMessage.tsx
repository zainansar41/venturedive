import type { Message } from "../../types";
import { SourceCitations } from "./SourceCitations";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <article className="ml-auto max-w-[85%]">
        <div className="rounded-md rounded-br-sm bg-accent px-4 py-3 text-sm leading-6 text-white">
          <p className="whitespace-pre-wrap">{message.text}</p>
        </div>
      </article>
    );
  }

  return (
    <article className="mr-auto max-w-[92%]">
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-text-muted">
        Assistant
      </p>
      <div className="surface-card-raised px-4 py-3">
        <p className="whitespace-pre-wrap text-sm leading-6 text-text">{message.text}</p>
        {message.sources && message.sources.length > 0 && (
          <SourceCitations sources={message.sources} />
        )}
      </div>
    </article>
  );
}
