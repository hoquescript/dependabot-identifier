import { BATCH_SIZE } from "../config";
import pool from "../library/db";

export interface Repository {
  id: number;
  name: number;
  user_id: number;
}
export async function getRepositories(props: {
  offset: number;
  limit: number;
}): Promise<Repository[]> {
  const { offset, limit } = props;
  const query = `
    SELECT id, name, user_id
      FROM public.repositories t
      LIMIT ${limit}
      OFFSET ${offset}
  `;

  const { rows } = await pool.query(query);
  return rows;
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
