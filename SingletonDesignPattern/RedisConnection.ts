import Redis, { RedisOptions } from "ioredis";
import logger from "./Logger.config";
import { serverConfig } from "./config";

export class RedisConnection {
  private static instance: RedisConnection | null = null;
  private Client: Redis | null = null;
  private constructor() {}

  public static getInstance(): RedisConnection {
    if (!RedisConnection.instance) {
      RedisConnection.instance = new RedisConnection();
    }
    return RedisConnection.instance;
  }
  public connect(): Redis {
    if (this.Client) {
      logger.info("Redis is already connected");
      return this.Client;
    }
    const redisConfig: RedisOptions = {
      host: serverConfig.redisHost,
      port: serverConfig.redisPort,
      maxRetriesPerRequest: null,
    };
    logger.info("Redis connected successfully");
    this.Client = new Redis(redisConfig);
    return this.Client;
  }
}


// usage

const redisConnection = RedisConnection.getInstance();
redisConnection.connect();