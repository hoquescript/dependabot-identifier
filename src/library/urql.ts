import { Client, cacheExchange, fetchExchange } from "@urql/core";
import { GITHUB_TOKEN } from "../config";

const client = new Client({
  url: "https://api.github.com/graphql",
  exchanges: [fetchExchange],
  fetchOptions: {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      "Content-Type": "application/json",
    },
  },
});

export default client;
