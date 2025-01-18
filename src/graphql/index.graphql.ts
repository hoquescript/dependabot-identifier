import { gql } from "@urql/core";

export const RATE_LIMIT_QUERY = gql`
  {
    rateLimit {
      limit
      cost
      remaining
      resetAt
    }
  }
`;
export const DEPENDABOT_QUERY = `
  query GetDependabotExistence {
    repository(owner: "hoquescript", name: "dependabot-identifier") {
      yml: object(expression: "HEAD:dependabot.yml") {
        ... on Blob {
          text
        }
      }
      yaml: object(expression: "HEAD:dependabot.yaml") {
        ... on Blob {
          text
        }
      }
    }
  }
`;

const QUERY = gql`
  query GetDependabotExistence {
    hoquescript311: repository(
      owner: "hoquescript"
      name: "dependabot-identifier"
    ) {
      yml: object(expression: "HEAD:dependabot.yml") {
        ... on Blob {
          text
        }
      }
      yaml: object(expression: "HEAD:dependabot.yaml") {
        ... on Blob {
          text
        }
      }
    }
  }
`;
