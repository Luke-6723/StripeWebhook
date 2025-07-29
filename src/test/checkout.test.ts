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

  it("A valid checkout post should return a checkout URL with params set", async () => {
    const response = await request(app)
      .post("/api/checkout")
      .send({
        "successRedirect": "http://localhost:3000/success",
        "cancelRedirect": "http://localhost:3000/cancel",
        "email": "automated_testing@ichigo.uk",
        "userId": "automated_testing",
        "allowCoupon": true,
        "consentCollection": {
          "payment_method_reuse_agreement": { "position": "hidden" },
          "terms_of_service": "required"
        },
        "customText": {
          "after_submit": { "message": "Thank you for your purchase!" },
          "terms_of_service_acceptance": { "message": "I agree to the terms of service." }
        },
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