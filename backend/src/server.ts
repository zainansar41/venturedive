import { createRuntimeApp } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./utils/logger.js";

async function bootstrap() {
  const { app } = await createRuntimeApp();
  app.listen(env.PORT, () => {
    logger.info("server", `Backend listening on port ${env.PORT}`);
  });
}

bootstrap().catch((error) => {
  logger.error("server", "Failed to bootstrap backend", {
    error: error instanceof Error ? error.message : String(error)
  });
  process.exit(1);
});
