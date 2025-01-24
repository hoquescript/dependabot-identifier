import { Pool } from "pg";
import { Repository } from "./repositories";

class DatabaseManager {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async getProgress(): Promise<{ batchNumber: number; totalScanned: number }> {
    const result = await this.pool.query(`
      SELECT batch_number, total_scanned 
      FROM scanning_progress 
      ORDER BY updated_at DESC 
      LIMIT 1
    `);
    return result.rows[0] || { batchNumber: 0, totalScanned: 0 };
  }

  async updateProgress(
    batchNumber: number,
    totalScanned: number,
  ): Promise<void> {
    await this.pool.query(
      `
      INSERT INTO scanning_progress 
        (batch_number, total_scanned, updated_at)
      VALUES ($1, $2, CURRENT_TIMESTAMP)
    `,
      [batchNumber, totalScanned],
    );
  }

  async fetchUnscannedRepositories(
    batchNumber: number,
    batchSize: number,
  ): Promise<Repository[]> {
    const result = await this.pool.query<Repository>(
      `
      WITH unscanned_repos AS (
        SELECT r.id, r.name, r.user_id
        FROM public.repositories r
        LEFT JOIN repository_scan_results s ON r.id = s.repository_id
        WHERE s.repository_id IS NULL
        ORDER BY r.id
        LIMIT $1
        OFFSET $2
      )
      SELECT * FROM unscanned_repos
    `,
      [batchSize, batchNumber * batchSize],
    );

    return result.rows;
  }

  async saveResults(
    results: Array<{
      id: number;
      hasDependabot: boolean;
      error?: string;
    }>,
  ): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");

      for (const result of results) {
        await client.query(
          `
          INSERT INTO repository_scan_results 
            (repository_id, has_dependabot, scan_error)
          VALUES ($1, $2, $3)
          ON CONFLICT (repository_id) DO UPDATE
          SET 
            has_dependabot = $2,
            scan_error = $3,
            scanned_at = CURRENT_TIMESTAMP
        `,
          [result.id, result.hasDependabot, result.error],
        );
      }

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async getTotalUnscannedCount(): Promise<number> {
    const result = await this.pool.query(`
      SELECT COUNT(*) as count
      FROM public.repositories r
      LEFT JOIN repository_scan_results s ON r.id = s.repository_id
      WHERE s.repository_id IS NULL
    `);
    return parseInt(result.rows[0].count);
  }
}

export default DatabaseManager;
