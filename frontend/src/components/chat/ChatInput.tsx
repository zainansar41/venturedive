import { useEffect, useRef, type FormEvent, type KeyboardEvent } from "react";
import { Spinner } from "../ui/Spinner";

interface ChatInputProps {
  value: string;
  disabled: boolean;
  loading: boolean;
  hasSession: boolean;
  onChange: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
}

const MAX_LINES = 4;
const LINE_HEIGHT = 24;

export function ChatInput({ value, disabled, loading, hasSession, onChange, onSubmit }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    const maxHeight = LINE_HEIGHT * MAX_LINES + 24;
    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
  }, [value]);

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (!disabled && !loading && value.trim()) {
        onSubmit(event as unknown as FormEvent);
      }
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex items-end gap-3 border-t border-border bg-surface p-4">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={hasSession ? "Ask about the article…" : "Ingest an article to start chatting…"}
        className="input-field focus-ring min-h-[44px] resize-none py-3 leading-6"
        disabled={disabled}
        rows={1}
        aria-label="Chat message"
      />
      <button
        type="submit"
        disabled={disabled || loading || !value.trim()}
        className="btn-primary focus-ring shrink-0 px-4"
      >
        {loading ? (
          <>
            <Spinner />
            <span className="hidden sm:inline">Thinking…</span>
          </>
        ) : (
          "Send"
        )}
      </button>
    </form>
  );
}
