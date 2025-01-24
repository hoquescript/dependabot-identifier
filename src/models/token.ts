interface TokenStatus {
  token: string;
  remainingPoints: number;
  resetAt: Date;
}

class GitHubTokenManager {
  private tokens: TokenStatus[] = [];

  constructor(tokens: string[]) {
    this.tokens = tokens.map((token) => ({
      token,
      remainingPoints: 5000,
      resetAt: new Date(),
    }));
  }

  async getBestToken(): Promise<string> {
    const now = new Date();
    const availableTokens = this.tokens
      .filter((t) => t.remainingPoints > 0 || t.resetAt < now)
      .sort((a, b) => b.remainingPoints - a.remainingPoints);

    if (availableTokens.length === 0) {
      const earliestReset = Math.min(
        ...this.tokens.map((t) => t.resetAt.getTime()),
      );
      const waitTime = earliestReset - now.getTime() + 1000;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
      return this.getBestToken();
    }

    return availableTokens[0].token;
  }

  updateTokenLimits(token: string, remaining: number, resetAt: Date): void {
    const tokenStatus = this.tokens.find((t) => t.token === token);
    if (tokenStatus) {
      tokenStatus.remainingPoints = remaining;
      tokenStatus.resetAt = resetAt;
    }
  }

  getTokenStatuses(): string {
    return this.tokens
      .map((t) => ({
        token: t.token.slice(0, 8),
        remaining: t.remainingPoints,
        resetIn: Math.max(0, t.resetAt.getTime() - Date.now()) / 1000,
      }))
      .map(
        (t) =>
          `Token ${t.token}... Points: ${
            t.remaining
          }, Reset in: ${t.resetIn.toFixed(0)}s`,
      )
      .join("\n");
  }

  startStatusMonitoring(interval = 60000): void {
    setInterval(() => {
      console.log("\nToken Status:\n" + this.getTokenStatuses() + "\n");
    }, interval);
  }
}

export default GitHubTokenManager;
