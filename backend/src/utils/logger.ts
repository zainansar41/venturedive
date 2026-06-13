function formatMeta(meta?: Record<string, unknown>): string {
  if (!meta || Object.keys(meta).length === 0) return "";
  return ` ${JSON.stringify(meta)}`;
}

export const logger = {
  info(scope: string, message: string, meta?: Record<string, unknown>): void {
    console.log(`[${scope}] ${message}${formatMeta(meta)}`);
  },

  warn(scope: string, message: string, meta?: Record<string, unknown>): void {
    console.warn(`[${scope}] ${message}${formatMeta(meta)}`);
  },

  error(scope: string, message: string, meta?: Record<string, unknown>): void {
    console.error(`[${scope}] ${message}${formatMeta(meta)}`);
  },

  time(scope: string, label: string): () => void {
    const start = performance.now();
    logger.info(scope, `${label} started`);
    return () => {
      const durationMs = Math.round(performance.now() - start);
      logger.info(scope, `${label} completed`, { durationMs });
    };
  }
};
