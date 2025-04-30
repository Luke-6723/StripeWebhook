import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET || "", { apiVersion: "2025-03-31.basil" });