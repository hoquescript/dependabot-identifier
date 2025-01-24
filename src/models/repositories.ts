import { Pool } from "pg";
export interface Repository {
  id: number;
  name: number;
  user_id: number;
}

export async function fetchRepositoriesBatch(
  pool: Pool,
  lastId: number,
  batchSize: number,
): Promise<Repository[]> {
  const result = await pool.query<Repository>(
    `
    SELECT id, name, user_id
    FROM public.repositories
    WHERE id > $1
    AND id NOT IN (
      SELECT repository_id 
      FROM repository_dependabot_status
      WHERE error IS NULL
    )
    ORDER BY id
    LIMIT $2
  `,
    [lastId, batchSize],
  );

  return result.rows;
}

// export async function insertRepositories(repositories: Repository[]) {
//   const values = repositories.map(
//     (repository) =>
//       `('${repository.project_id}', '${repository.user_name}', '${repository.project_name}', '${repository.url}')`,
//   );
//   const query = `INSERT INTO repositories (project_id, user_name, project_name, url) VALUES ${values.join(
//     ",",
//   )}`;
//   await pool.query(query);
// }
