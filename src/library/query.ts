import axios from "axios";
import pQueue from "p-queue";
import { GITHUB_TOKENS } from "../config";

export const github = axios.create({
  headers: {
    Authorization: `token ${process.env.GITHUB_TOKEN}`,
    Accept: "application/vnd.github.v3+json",
  },
});

export const queue = new pQueue({
  concurrency: GITHUB_TOKENS.length * 2,
  interval: 1000,
  intervalCap: GITHUB_TOKENS.length,
});
