const { Pool } = require("pg");
const axios = require("axios");
const pQueue = require("p-queue");

// Simple configuration
const config = {
  db: {
    host: "localhost",
    port: 5432,
    user: "username",
    password: "password",
    database: "dbname",
  },
  github: {
    token: "your_github_token",
    batchSize: 5000,
    concurrency: 20,
  },
};

// Create database pool and API client
const pool = new Pool(config.db);
const github = axios.create({
  headers: {
    Authorization: `token ${config.github.token}`,
    Accept: "application/vnd.github.v3+json",
  },
});
const queue = new pQueue({ concurrency: config.github.concurrency });

// Process GitHub request with retries
async function fetchGitHubData(url) {
  try {
    const response = await github.get(url);
    return response.data;
  } catch (error) {
    if (error.response?.status === 403) {
      // Handle rate limit
      const resetTime = error.response.headers["x-ratelimit-reset"] * 1000;
      const waitTime = Math.max(0, resetTime - Date.now());
      await new Promise((resolve) => setTimeout(resolve, waitTime));
      return fetchGitHubData(url); // Retry after waiting
    }
    throw error;
  }
}

// Process records in batches
async function processRecords() {
  let offset = 0;
  let processed = 0;
  const startTime = Date.now();

  while (true) {
    try {
      // 1. Fetch batch from database
      const { rows: batch } = await pool.query(
        `
                SELECT id, github_url 
                FROM source_table 
                ORDER BY id 
                LIMIT $1 OFFSET $2
            `,
        [config.github.batchSize, offset],
      );

      if (batch.length === 0) break;

      // 2. Process batch with GitHub API
      const results = await Promise.all(
        batch.map((record) =>
          queue.add(async () => {
            try {
              const data = await fetchGitHubData(record.github_url);
              return { id: record.id, data, success: true };
            } catch (error) {
              console.error(`Failed ID ${record.id}:`, error.message);
              return { id: record.id, success: false };
            }
          }),
        ),
      );

      // 3. Save successful results to database
      const successfulResults = results.filter((r) => r.success);
      if (successfulResults.length > 0) {
        await pool.query(
          `
                    INSERT INTO processed_table (id, github_data, processed_at)
                    SELECT * FROM UNNEST($1::int[], $2::jsonb[], $3::timestamp[])
                    ON CONFLICT (id) DO UPDATE SET
                        github_data = EXCLUDED.github_data,
                        processed_at = EXCLUDED.processed_at
                `,
          [
            successfulResults.map((r) => r.id),
            successfulResults.map((r) => r.data),
            successfulResults.map(() => new Date()),
          ],
        );
      }

      // 4. Update progress
      processed += successfulResults.length;
      const elapsedMinutes = (Date.now() - startTime) / 1000 / 60;
      console.log(`
                Processed ${processed} records
                Speed: ${(processed / elapsedMinutes).toFixed(2)} records/minute
                Current batch: ${successfulResults.length} successful / ${
        batch.length
      } total
            `);

      offset += batch.length;
    } catch (error) {
      console.error("Batch processing error:", error);
      // Wait a bit before retrying
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }

  return processed;
}

// Main function
async function main() {
  try {
    console.log("Starting processing...");
    const totalProcessed = await processRecords();
    console.log(`Finished! Processed ${totalProcessed} records`);
  } catch (error) {
    console.error("Processing failed:", error);
  } finally {
    await pool.end();
  }
}

main();
