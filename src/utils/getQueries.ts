import { Repository } from "../models/repositories";

function generateQueries(repositories: Repository[]) {
  return `
    query GetDependabotExistence {
      ${repositories
        .map(
          (repository) =>
            `repository_${repository.id}:repository(owner: "${repository.user_id}", name: "${repository.project_name}") {
            yml: object(expression: "HEAD:.github/dependabot.yml") {
              id
            }
            yaml: object(expression: "HEAD:.github/dependabot.yaml") {
              id
            }            
          }`,
        )
        .join("\n")}
    }
  `;
}

export default generateQueries;
