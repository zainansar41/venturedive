import type { ReactNode } from "react";
import { Header } from "./Header";

interface AppShellProps {
  sessionId: string;
  onResetSession: () => void;
  leftPanel: ReactNode;
  rightPanel: ReactNode;
}

export function AppShell({ sessionId, onResetSession, leftPanel, rightPanel }: AppShellProps) {
  return (
    <div className="flex h-full flex-col">
      <Header sessionId={sessionId} onResetSession={onResetSession} />

      <div className="flex min-h-0 flex-1 flex-col lg:grid lg:grid-cols-[minmax(320px,2fr)_minmax(0,3fr)] lg:overflow-hidden">
        <aside className="flex flex-col gap-5 overflow-y-auto border-b border-border bg-surface/40 p-4 md:p-6 lg:border-b-0 lg:border-r">
          {leftPanel}
        </aside>

        <main className="chat-panel-bg flex min-h-0 flex-1 flex-col lg:overflow-hidden">
          {rightPanel}
        </main>
      </div>
    </div>
  );
}
