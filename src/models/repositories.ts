import { BATCH_SIZE } from "../config";
import pool from "../library/db";

export interface Repository {
  id: number;
  project_id: number;
  actor_id: number;
  action: string;
  project_name: string;
  user_id: string;
}
export async function getRepositories(offset: number): Promise<Repository[]> {
  const query = `SELECT
    pr.pullreq_id AS id,
    pr.base_repo_id AS project_id,
    prh.actor_id,
    prh.action,
    p.name AS project_name,
    u.login AS user_id
FROM pull_requests pr
JOIN pull_request_history prh
    ON pr.id = prh.pull_request_id
JOIN projects p
    ON pr.base_repo_id = p.id
JOIN users u
            ON p.owner_id = u.id
WHERE prh.actor_id IN (
    35575591,
    40269514,
    41079142,
    46805434,
    51697751,
    51697753,
    53095603,
    54330291,
    59222948,
    60691324,
    60762351,
    62767315,
    63325809,
    64190644,
    67846025,
    67967921
)
OFFSET 6
LIMIT 6;`;

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
