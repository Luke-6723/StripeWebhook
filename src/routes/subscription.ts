/**
 * /api/customer
 */
import express from "express";
import { processEvent } from "@/utils/processEvent";
import { stripe } from "@/utils/stripe";
import { kv } from "@/utils/kv";

const stripeCustomerRouter = express.Router();

stripeCustomerRouter.get("/api/customer/:customerId", async (req, res) => {
  const customerId = req.params.customerId;
  let stripeCustomerId;
  let subData;

  if (customerId) {
    subData = await kv.get(`stripe:customer:${customerId}`);

    if (subData?.startsWith("cus_")) {
      stripeCustomerId = subData;
      subData = await kv.get(`stripe:customer:${stripeCustomerId}`);
    }
  }

  if (subData) {
    res.status(200).json({
      data: {
        // If the provided a cus_ they know it already this is here for consistency
        customerId: stripeCustomerId || customerId,
        ...JSON.parse(subData)
      }
    });
    return;
  }

  res.status(404).json({ error: "Not Found" });
  return;
});

export default stripeCustomerRouter;