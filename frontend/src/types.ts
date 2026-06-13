export interface IngestResponse {
  sessionId: string;
  title: string;
  summary: string;
}

export interface ChatSource {
  sectionTitle: string;
  snippet: string;
}

export interface ChatResponse {
  answer: string;
  sources: ChatSource[];
}

export interface ApiError {
  error: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  sources?: ChatSource[];
}
