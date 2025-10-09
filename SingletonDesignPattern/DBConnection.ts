import mongoose from "mongoose";
import logger from "./Logger.config";
import { serverConfig } from "./config";

export class MongoDBConnection {
  private static instance: MongoDBConnection | null = null;

  private isConnected = false;

  private constructor() {}

  public static getInstance(): MongoDBConnection {
    if (!MongoDBConnection.instance) {
      MongoDBConnection.instance = new MongoDBConnection();
    }
    return MongoDBConnection.instance;
  }
  public async connect(): Promise<void> {
    if (this.isConnected) {
      logger.info("Database is already connected");
      return;
    }
    try {
      const dbUrl = serverConfig.dbUrl;
      await mongoose.connect(dbUrl);
      this.isConnected = true;
      logger.info("Database connected successfully");
    } catch (error) {
      logger.error("Database connection failed", error);
    }
  }
}

// usage:

const dbConnection = MongoDBConnection.getInstance();
await dbConnection.connect();
