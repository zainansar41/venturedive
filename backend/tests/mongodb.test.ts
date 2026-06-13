import { describe, expect, it, vi } from "vitest";
import { MongoService } from "../src/services/mongodb.js";

describe("MongoService", () => {
  it("throws if chunks collection is requested before connect", () => {
    const service = new MongoService("mongodb://localhost:27017", "db", "chunks");
    expect(() => service.getChunksCollection()).toThrowError();
  });

  it("connect and close can be called with mocked client", async () => {
    const service = new MongoService("mongodb://localhost:27017", "db", "chunks");
    const fakeCollection = {};
    const fakeClient = {
      connect: vi.fn(async () => undefined),
      close: vi.fn(async () => undefined),
      db: vi.fn(() => ({
        collection: vi.fn(() => fakeCollection)
      }))
    };
    (service as unknown as { client: typeof fakeClient }).client = fakeClient;

    await service.connect();
    expect(service.getChunksCollection()).toBe(fakeCollection);
    await service.close();
    expect(fakeClient.close).toHaveBeenCalled();
  });
});
