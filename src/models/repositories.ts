import pool from "../library/db";
import logger from "../library/logger";
import client from "../library/urql";
import tokenManager from "./token";

export interface Repository {
  id: number;
  name: string;
  user_name: string;
}
export async function getRepositories(props: {
  offset: number;
  limit: number;
}): Promise<Repository[]> {
  const { offset, limit } = props;
  const query = `
    SELECT id, name, user_name
      FROM public.repositories t
      ORDER BY id ASC
      LIMIT ${limit}
      OFFSET ${offset}
  `;

  const { rows } = await pool.query(query);
  return rows;
}

interface Response {
  [key: string]: {
    yml: null | any;
    yaml: null | any;
  };
}
export async function getMetaInfo(
  queries: string,
): Promise<Response | undefined> {
  const { data } = await client
    .query<Response>(
      queries,
      {},
      {
        fetchOptions: {
          headers: {
            Authorization: `Bearer ${tokenManager.getCurrentToken()}`,
          },
        },
      },
    )
    .toPromise();
  return data;
}

export async function updateRepository(id: number, type: "yaml" | "yml") {
  const query = `
    UPDATE repositories
      SET installed = true, extension = '${type}'
      WHERE id = ${id};
  `;
  await pool.query(query);
}
