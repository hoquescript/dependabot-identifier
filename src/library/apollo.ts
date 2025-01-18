import { Client, cacheExchange, fetchExchange } from "@urql/core";

const client = new Client({
  url: "https://api.github.com/graphql",
  exchanges: [cacheExchange, fetchExchange],
  fetchOptions: {
    headers: {
      Authorization: `Bearer ${process.env.NODE_GITHUB_TOKEN}`,
      "Content-Type": "application/json",
    },
  },
});

export default client;
