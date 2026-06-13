import type { SessionData } from "../types/domain.js";

export class SessionStore {
  private sessions = new Map<string, SessionData>();

  set(session: SessionData): void {
    this.sessions.set(session.sessionId, session);
  }

  get(sessionId: string): SessionData | undefined {
    return this.sessions.get(sessionId);
  }

  has(sessionId: string): boolean {
    return this.sessions.has(sessionId);
  }

  delete(sessionId: string): void {
    this.sessions.delete(sessionId);
  }
}
