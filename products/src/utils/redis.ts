import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL ?? "redis://:osbanas2025redis@localhost:6379";

export const redis =new Redis({
  host: REDIS_URL,
  port: 6379,
  tls: {}
});