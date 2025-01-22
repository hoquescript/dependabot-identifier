require("dotenv").config();

export const CONCURRENCY = 5;
export const BATCH_SIZE = 100;

export const DB_CONFIG = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

export const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
