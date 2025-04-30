import "dotenv/config";

import Redis from "ioredis";

export const kv = new Redis({
  host: process.env.KEYDB_HOST,
  port: Number(process.env.KEYDB_PORT) || 6379,
  db: 0
});