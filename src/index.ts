import { DependabotResponse } from "./interfaces/MessageResponse";
import pool from "./library/db";
import { github, queue } from "./library/query";
import { getRepositories, Repository } from "./models/repositories";
import { getDependabot, hasDependabotFile } from "./services/contents";

async function main() {
  try {
    let offset = 0;
    let processed = 0;
    const startTime = Date.now();

    while (true) {
      try {
        // Fetch repositories from database
        const batch = await getRepositories(offset);
        if (batch.length === 0) break;

        // Process each batch with GitHub API
        const results: DependabotResponse[] = await Promise.all(
          batch.map((record) =>
            queue.add(async () => {
              try {
                // Verifying if the project contains yml file
                const hasDependabotYml = await hasDependabotFile(
                  record.user_name,
                  record.project_name,
                  "yml",
                );
                if (hasDependabotYml) return getData(record);

                // Verifying if the project contains yaml file
                const hasDependabotYaml = await hasDependabotFile(
                  record.user_name,
                  record.project_name,
                  "yaml",
                );
                if (hasDependabotYaml) return getData(record);

                return {
                  id: record.project_id,
                  user_name: record.user_name,
                  project_name: record.project_name,
                  url: record.url,
                  success: true,
                };
              } catch (error: any) {
                return {
                  id: record.project_id,
                  user_name: record.user_name,
                  project_name: record.project_name,
                  url: record.url,
                  success: false,
                };
              }
            }),
          ),
        );
        console.log(results);

        break;
      } catch (error) {
        throw error;
      }
    }
  } catch (error) {
    console.error("Processing failed:", error);
  } finally {
    await pool.end();
  }
}

// main();

function getData(record: Repository) {
  return {
    id: record.project_id,
    user_name: record.user_name,
    project_name: record.project_name,
    url: record.url,
    success: true,
  };
}
