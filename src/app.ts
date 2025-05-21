import {
  getMetaInfo,
  getRepositories,
  updateRepository,
} from "./models/repositories";
import generateQueries from "./utils/getQueries";
import getLimit from "./utils/getLimit";
import { BATCH_SIZE, REPOSITORY_COUNT } from "./config";
import tokenManager from "./models/token";
import { updateProgress } from "./models/progress";
import logger from "./library/logger";

const CURRENT_BATCH = 25597;
const LAST_REPO_Id = 158220855;
async function run() {
  let batch = CURRENT_BATCH;
  let offset = batch * BATCH_SIZE;
  let lastId = LAST_REPO_Id;
  while (REPOSITORY_COUNT > offset) {
    try {
      const repositories = await getRepositories({
        lastId: lastId,
        limit: BATCH_SIZE,
      });
      const queries = generateQueries(repositories);
      try {
        const data = await getMetaInfo(queries);
        if (!data) {
          logger.error(
            `Batch Error: ${batch}, Offset: ${offset}, First Repository: ${
              repositories[0].id
            }, Last Repository: ${repositories[repositories.length - 1].id}`,
          );
          continue;
        }
        Object.entries(data).forEach(([key, value]) => {
          // If the repository is non-existent at this moment
          if (!value) return;

          // If the repository has no dependabot file
          const { yml, yaml } = value;
          if (!yml && !yaml) return;

          // If the repository has dependabot file
          const repositoryId = Number(key.split("_")[1]);
          if (!repositoryId) return;

          logger.info({ key: repositoryId, value });

          if (yml) {
            updateRepository(repositoryId, "yml");
          } else {
            updateRepository(repositoryId, "yaml");
          }
        });
      } catch (apiError: any) {
        // Rate limit handling
        if (apiError.message.includes("rate limit")) {
          logger.warn("Rate limit reached. Waiting...");
          tokenManager.rotateToken();
          await tokenManager.waitForReset();
          continue; // Retry the current batch
        }
        throw apiError;
      }

      // Updating the progress in the database
      console.log(`DEBUG: Batch: ${batch}, Offset: ${offset}`);
      await updateProgress({
        offset_count: offset,
        batch_number: batch,
        first_repo: repositories[0].id,
        last_repo: lastId,
      });

      // Incrementing the values for the next batch
      offset += BATCH_SIZE;
      batch++;
      lastId = repositories[repositories.length - 1].id;
    } catch (error) {
      console.log(error);
    }
  }
}
run();
