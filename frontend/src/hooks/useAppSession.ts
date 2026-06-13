import { useMemo, useState, type FormEvent } from "react";
import { askQuestion, ingestArticle } from "../api";
import type { Message } from "../types";

export function useAppSession() {
  const [url, setUrl] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [articleTitle, setArticleTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingIngest, setLoadingIngest] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [error, setError] = useState("");
  const [summaryJustLoaded, setSummaryJustLoaded] = useState(false);

  const canChat = useMemo(() => Boolean(sessionId && !loadingChat), [sessionId, loadingChat]);

  async function onIngest(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoadingIngest(true);
    setSummaryJustLoaded(false);

    try {
      const result = await ingestArticle(url);
      setSessionId(result.sessionId);
      setArticleTitle(result.title);
      setSummary(result.summary);
      setSummaryJustLoaded(true);
      setMessages([
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text: "Article ready. Ask me anything from the ingested context."
        }
      ]);
    } catch (ingestError) {
      setError(ingestError instanceof Error ? ingestError.message : "Failed to ingest article");
    } finally {
      setLoadingIngest(false);
    }
  }

  async function onAsk(event: FormEvent) {
    event.preventDefault();
    if (!chatInput.trim() || !sessionId || loadingChat) return;

    const message = chatInput.trim();
    setChatInput("");
    setLoadingChat(true);
    setError("");

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      text: message
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      const result = await askQuestion(sessionId, message);
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        text: result.answer,
        sources: result.sources
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (chatError) {
      setError(chatError instanceof Error ? chatError.message : "Failed to fetch response");
    } finally {
      setLoadingChat(false);
    }
  }

  function resetSession() {
    setSessionId("");
    setArticleTitle("");
    setSummary("");
    setMessages([]);
    setError("");
    setSummaryJustLoaded(false);
  }

  function dismissError() {
    setError("");
  }

  function handleSuggestedPrompt(prompt: string) {
    setChatInput(prompt);
  }

  return {
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
  };
}
