import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";

import * as middlewares from "./middlewares";
import MessageResponse from "./interfaces/MessageResponse";
import axios from "axios";

require("dotenv").config();

const app = express();

app.use(morgan("dev"));
app.use(helmet());
app.use(cors());
app.use(express.json());

const SAMPLE = {
  200: {
    username: "hoquescript",
    repository: "dependabot-identifier",
  },
  404: {
    username: "Kuznetsov228",
    repository: "lab00",
  },
};

const PROJECTS = [
  {
    username: "hoquescript",
    repository: "dependabot-identifier",
  },
  {
    username: "Kuznetsov228",
    repository: "lab00",
  },
];

app.get<{}, MessageResponse>("/", async (req, res) => {
  const enabledProjects = [];
  const disabledProjects = [];
  for (const project of PROJECTS) {
    try {
      const owner = project.username;
      const repo = project.repository;
      await axios.get(
        `https://api.github.com/repos/${owner}/${repo}/contents/dependabot.yml`,
        {
          headers: {
            Authorization: `token ${process.env.GITHUB_TOKEN}`,
          },
        },
      );
      enabledProjects.push(project);
    } catch (error) {
      disabledProjects.push(project);
    }
  }
  res.json({
    message: "Dependabot Identifier",
    response: {
      enabledProjects,
      disabledProjects,
    },
  });
});

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

export default app;
