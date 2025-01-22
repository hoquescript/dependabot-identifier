import { Repository } from "../models/repositories";

function generateQueries(repositories: Repository[]): string {
  return `
    query GetDependabotExistence {
      ${repositories
        .map(
          (repository) =>
            `repository_${repository.id}:repository(owner: "${repository.user_id}", name: "${repository.name}") {
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
