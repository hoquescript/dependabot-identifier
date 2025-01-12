import { github } from "../library/query";

export async function hasDependabotFile(
  owner: string,
  repo: string,
  extension?: "yaml" | "yml",
) {
  try {
    await github.get(
      `https://api.github.com/repos/${owner}/${repo}/contents/.github/dependabot.${extension}`,
    );
    return true;
  } catch (error: any) {
    if (error.response?.status === 403) {
      // Handle rate limit
      const resetTime = error.response.headers["x-ratelimit-reset"] * 1000;
      const waitTime = Math.max(0, resetTime - Date.now());
      await new Promise((resolve) => setTimeout(resolve, waitTime));
      return getDependabot(owner, repo); // Retry after waiting
    }
    return false;
  }
}

export async function getDependabot(owner: string, repo: string) {
  try {
    const response = await github.get(
      `https://api.github.com/repos/${owner}/${repo}/contents/.github/dependabot.yml`,
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 403) {
      // Handle rate limit
      const resetTime = error.response.headers["x-ratelimit-reset"] * 1000;
      const waitTime = Math.max(0, resetTime - Date.now());
      await new Promise((resolve) => setTimeout(resolve, waitTime));
      return getDependabot(owner, repo); // Retry after waiting
    }
    throw error;
  }
}
