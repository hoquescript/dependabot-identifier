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

app.get<{}, MessageResponse>("/", async (req, res) => {
  try {
    // Repository Owner Name
    const owner = "Kuznetsov228";
    // Repository Name
    const repo = "lab00";
    // File to match
    const path = "dependabot.yml";

    // Fetching file information
    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      {
        headers: {
          Authorization: `token ${process.env.GITHUB_TOKEN}`,
        },
      },
    );
    res.json({
      message: "Project contains a dependabot file",
      response: response.data,
    });
  } catch (err) {
    //If the dependabot.yml is not installed this error will be thrown
    res.status(404).json({
      message: "Project does not contain a dependabot file",
    });
  }
});

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

export default app;
