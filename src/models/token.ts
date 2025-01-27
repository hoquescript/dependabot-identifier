import { GITHUB_TOKENS } from "../config";
import { RATE_LIMIT_QUERY } from "../graphql/index.graphql";
import client from "../library/urql";

class TokenManager {
  private tokens: string[];
  private currentTokenIndex: number = 0;

  constructor(tokens: string[]) {
    this.tokens = tokens;
  }

  getCurrentToken(): string {
    return this.tokens[this.currentTokenIndex];
  }

  rotateToken() {
    this.currentTokenIndex = (this.currentTokenIndex + 1) % this.tokens.length;
  }

  async checkRateLimit(): Promise<number> {
    try {
      const { data } = await client.query(RATE_LIMIT_QUERY, {}).toPromise();
      return data?.rateLimit?.resetAt
        ? new Date(data.rateLimit.resetAt).getTime()
        : Date.now() + 15 * 60 * 1000; // Default 15 min wait
    } catch {
      return Date.now() + 15 * 60 * 1000;
    }
  }

  async waitForReset() {
    const resetTime = await this.checkRateLimit();
    const waitTime = resetTime - Date.now();

    if (waitTime > 0) {
      console.log(`Waiting for ${waitTime / 1000} seconds`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }
}

const tokenManager = new TokenManager(GITHUB_TOKENS);

export default tokenManager;
