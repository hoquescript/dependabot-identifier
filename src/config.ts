require("dotenv").config();

export const CONCURRENCY = 5;
export const BATCH_SIZE = 100;

export const GITHUB_TOKENS: string[] = [
  process.env.GITHUB_TOKEN_1!,
  process.env.GITHUB_TOKEN_2!,
  process.env.GITHUB_TOKEN_3!,
  process.env.GITHUB_TOKEN_4!,
  process.env.GITHUB_TOKEN_5!,
  process.env.GITHUB_TOKEN_6!,
];

export const DB_CONFIG = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

export const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
