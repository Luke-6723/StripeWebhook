import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../server.js";
import { kv } from "@/utils/kv.js";

describe("GET /api/customer/automated_testing", () => {
  it("index route should return hello world", async () => {
  
    await kv.set("stripe:customer:user_id_here", "cus_automated_testing");

    await kv.set("stripe:customer:cus_automated_testing",
      JSON.stringify({
        data: {
          customerId: "cus_SEWKdGvyAcCTVR",
          subscriptionId: "sub_1RK3KFLNCuNIhHMWWOw9XjfP",
          status: "active",
          priceId: "price_1RJJASLNCuNIhHMWijOutmh4",
          currentPeriodEnd: 1748808197,
          currentPeriodStart: 1746129797,
          cancelAtPeriodEnd: false,
          paymentMethod: {
            brand: "visa",
            last4: "4242"
          }
        }
      })
    );

    const response = await request(app).get("/api/customer/user_id_here");
    expect(response.status).toBe(200);

    const response2 = await request(app).get("/api/customer/cus_automated_testing");
    expect(response2.status).toBe(200);
  });
});