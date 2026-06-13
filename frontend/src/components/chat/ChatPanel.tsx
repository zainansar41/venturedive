import { useEffect, useRef } from "react";
import type { Message } from "../../types";
import { ChatInput } from "./ChatInput";
import { ChatMessage } from "./ChatMessage";
import { TypingIndicator } from "./TypingIndicator";

const SUGGESTED_PROMPTS = [
  "What is this article about?",
  "Summarize the key points",
  "Who or what is the main subject?"
];

interface ChatPanelProps {
  sessionId: string;
  messages: Message[];
  chatInput: string;
  loadingChat: boolean;
  canChat: boolean;
  onChatInputChange: (value: string) => void;
  onAsk: (event: React.FormEvent) => void;
  onSuggestedPrompt: (prompt: string) => void;
}

export function ChatPanel({
  sessionId,
  messages,
  chatInput,
  loadingChat,
  canChat,
  onChatInputChange,
  onAsk,
  onSuggestedPrompt
}: ChatPanelProps) {
  const chatEndRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loadingChat]);

  const showSuggestedPrompts = sessionId && messages.length <= 1 && !loadingChat;

  return (
    <section
      className="flex min-h-0 flex-1 flex-col lg:min-h-[400px]"
      aria-busy={loadingChat}
    >
      <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3.5 md:px-6">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-text">Grounded Chat</h3>
          <span className="label-tag">AI</span>
        </div>
        {sessionId ? (
          <span className="flex items-center gap-2 rounded-md border border-border bg-surface/80 px-2.5 py-1 text-[11px] font-medium text-text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
            {sessionId.slice(0, 8)}…
          </span>
        ) : (
          <span className="text-[11px] text-text-muted">No active session</span>
        )}
      </div>

      <div
        ref={messagesRef}
        className="flex-1 space-y-4 overflow-y-auto p-4 md:p-5"
        aria-live="polite"
        aria-label="Chat messages"
      >
        {messages.length === 0 ? (
          <div className="flex h-full min-h-[200px] flex-col items-center justify-center text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-md bg-accent-muted">
              <svg
                className="h-6 w-6 text-accent"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                />
              </svg>
            </div>
            <p className="text-sm font-bold text-text">Ready to chat</p>
            <p className="mt-1 max-w-xs text-sm text-text-muted">
              Ingest a Wikipedia article to start asking grounded questions.
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {loadingChat && <TypingIndicator />}
          </>
        )}

        {showSuggestedPrompts && (
          <div className="flex flex-wrap gap-2 pt-2">
            {SUGGESTED_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => onSuggestedPrompt(prompt)}
                className="focus-ring rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-muted transition hover:border-accent hover:text-text"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      <ChatInput
        value={chatInput}
        disabled={!canChat}
        loading={loadingChat}
        hasSession={Boolean(sessionId)}
        onChange={onChatInputChange}
        onSubmit={onAsk}
      />
    </section>
  );
}
