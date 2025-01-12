import { BATCH_SIZE } from "../config";
import pool from "../library/db";

export interface Repository {
  project_id: number;
  user_name: string;
  project_name: string;
  url: string;
}
export async function getRepositories(offset: number): Promise<Repository[]> {
  // const { rows: batch } = await pool.query(
  //   `SELECT project_id, user_name, project_name FROM repositories LIMIT $1 OFFSET $2`,
  //   [BATCH_SIZE, offset],
  // );
  const { rows: batch } = await pool.query(
    `SELECT project_id, user_name, project_name FROM repositories LIMIT 10`,
    // [BATCH_SIZE, offset],
  );
  return batch;
}

export async function insertRepositories(repositories: Repository[]) {
  const values = repositories.map(
    (repository) =>
      `('${repository.project_id}', '${repository.user_name}', '${repository.project_name}', '${repository.url}')`,
  );
  const query = `INSERT INTO repositories (project_id, user_name, project_name, url) VALUES ${values.join(
    ",",
  )}`;
  await pool.query(query);
}
