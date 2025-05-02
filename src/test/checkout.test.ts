import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../server.js";

describe("POST /api/checkout", () => {
  it("A valid checkout post should return a checkout URL", async () => {
    const response = await request(app)
      .post("/api/checkout")
      .send({
        "successRedirect": "http://localhost:3000/success",
        "cancelRedirect": "http://localhost:3000/cancel",
        "email": "automated_testing@ichigo.uk",
        "userId": "automated_testing",
        "lineItems": [
          {
            "id": "prod_SDkfwwn0CqiYj9"
          }
        ]
      })
      .set("Content-Type", "application/json")
      .set("Accept", "application/json");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("url");
  });
});