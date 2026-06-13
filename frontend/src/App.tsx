import { AppShell } from "./components/layout/AppShell";
import { IngestForm } from "./components/ingest/IngestForm";
import { ArticleSummary } from "./components/summary/ArticleSummary";
import { ChatPanel } from "./components/chat/ChatPanel";
import { Alert } from "./components/ui/Alert";
import { useAppSession } from "./hooks/useAppSession";

function App() {
  const {
    url,
    setUrl,
    sessionId,
    articleTitle,
    summary,
    chatInput,
    setChatInput,
    messages,
    loadingIngest,
    loadingChat,
    error,
    summaryJustLoaded,
    canChat,
    onIngest,
    onAsk,
    resetSession,
    dismissError,
    handleSuggestedPrompt
  } = useAppSession();

  return (
    <AppShell
      sessionId={sessionId}
      onResetSession={resetSession}
      leftPanel={
        <>
          <IngestForm
            url={url}
            loadingIngest={loadingIngest}
            onUrlChange={setUrl}
            onSubmit={onIngest}
          />
          {error && <Alert message={error} onDismiss={dismissError} />}
          <ArticleSummary
            title={articleTitle}
            summary={summary}
            loading={loadingIngest}
            justLoaded={summaryJustLoaded}
          />
        </>
      }
      rightPanel={
        <ChatPanel
          sessionId={sessionId}
          messages={messages}
          chatInput={chatInput}
          loadingChat={loadingChat}
          canChat={canChat}
          onChatInputChange={setChatInput}
          onAsk={onAsk}
          onSuggestedPrompt={handleSuggestedPrompt}
        />
      }
    />
  );
}

export default App;
