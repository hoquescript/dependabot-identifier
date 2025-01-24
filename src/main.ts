import pQueue from "p-queue";
import { Pool } from "pg";
import { Repository } from "./models/repositories";
import pool from "./library/db";
import { GITHUB_TOKENS } from "./config";
import DatabaseManager from "./models/progress";
import GitHubTokenManager from "./models/token";
import queryGitHub from "./utils/getRepositoryInfo";
import { queue } from "./library/query";

// Main scanning function
export async function scanRepositories(
  pool: Pool,
  githubTokens: string[],
): Promise<void> {
  const dbManager = new DatabaseManager(pool);
  const tokenManager = new GitHubTokenManager(githubTokens);

  // Start token monitoring
  tokenManager.startStatusMonitoring();

  // Configure queue based on token count
  const { batchNumber, totalScanned } = await dbManager.getProgress();
  const BATCH_SIZE = 100; // Optimal size for GitHub GraphQL API
  let processedCount = totalScanned;
  let currentBatch = batchNumber;

  const totalToScan = await dbManager.getTotalUnscannedCount();
  console.log(`Starting scan of ${totalToScan.toLocaleString()} repositories`);

  const processBatch = async (repositories: Repository[]): Promise<void> => {
    const token = await tokenManager.getBestToken();

    try {
      const { data, rateLimit } = await queryGitHub(repositories, token);
      tokenManager.updateTokenLimits(
        token,
        rateLimit.remaining,
        rateLimit.resetAt,
      );

      const results = repositories.map((repo) => {
        const repoData = data.data[`repository_${repo.id}`];
        return {
          id: repo.id,
          hasDependabot: !!(repoData?.yml?.id || repoData?.yaml?.id),
        };
      });

      await dbManager.saveResults(results);

      return;
    } catch (error: any) {
      const results = repositories.map((repo) => ({
        id: repo.id,
        hasDependabot: false,
        error: error.message,
      }));
      await dbManager.saveResults(results);
      throw error;
    }
  };

  while (true) {
    try {
      const repositories = await dbManager.fetchUnscannedRepositories(
        currentBatch,
        BATCH_SIZE,
      );
      if (repositories.length === 0) break;

      await queue.add(() => processBatch(repositories));

      processedCount += repositories.length;
      currentBatch++;

      await dbManager.updateProgress(currentBatch, processedCount);

      const progress = ((processedCount / totalToScan) * 100).toFixed(2);
      console.log(
        `Progress: ${progress}% (${processedCount.toLocaleString()} / ${totalToScan.toLocaleString()})`,
      );

      // Refresh total count periodically
      if (currentBatch % 100 === 0) {
        const remainingToScan = await dbManager.getTotalUnscannedCount();
        console.log(
          `Remaining repositories to scan: ${remainingToScan.toLocaleString()}`,
        );
      }
    } catch (error) {
      console.error(`Error processing batch ${currentBatch}:`, error);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }

  await queue.onIdle();
  console.log(
    `Scan completed. Total repositories processed: ${processedCount.toLocaleString()}`,
  );
}

scanRepositories(pool, GITHUB_TOKENS).catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
