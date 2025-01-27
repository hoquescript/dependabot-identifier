import pool from "../library/db";

interface Progress {
  offset_count: number;
  batch_number: number;
  first_repo: number;
  last_repo: number;
}

async function updateProgress(progress: Progress) {
  const query = `
    INSERT INTO progress (offset_count, batch_number, first_repo, last_repo)
    VALUES (${progress.offset_count}, ${progress.batch_number}, ${progress.first_repo}, ${progress.last_repo})
  `;
  await pool.query(query);

  return query;
}

export { updateProgress };
