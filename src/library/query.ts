import axios from "axios";
import pQueue from "p-queue";

export const github = axios.create({
  headers: {
    Authorization: `token ${process.env.GITHUB_TOKEN}`,
    Accept: "application/vnd.github.v3+json",
  },
});

export const queue = new pQueue({ concurrency: 20 });
