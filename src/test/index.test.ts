import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../server.js";

describe("GET /", () => {
  it("index route should return hello world", async () => {
    const response = await request(app).get("/");
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("hello", "world");
  });
});