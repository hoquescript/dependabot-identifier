import axios from "axios";
import { Repository } from "../models/repositories";

async function queryGitHub(
  repositories: Repository[],
  token: string,
): Promise<{ data: any; rateLimit: { remaining: number; resetAt: Date } }> {
  const query = `
    query GetDependabotExistence {
      ${repositories
        .map(
          (repo) => `
        repository_${repo.id}: repository(owner: "${repo.user_id}", name: "${repo.name}") {
          yml: object(expression: "HEAD:.github/dependabot.yml") {
            id
          }
          yaml: object(expression: "HEAD:.github/dependabot.yaml") {
            id
          }
        }
      `,
        )
        .join("\n")}
    }
  `;

  const response = await axios.post(
    "https://api.github.com/graphql",
    { query },
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  return {
    data: response.data,
    rateLimit: {
      remaining: parseInt(response.headers["x-ratelimit-remaining"]),
      resetAt: new Date(parseInt(response.headers["x-ratelimit-reset"]) * 1000),
    },
  };
}

export default queryGitHub;
