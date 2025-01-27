import fs from "fs";
import path from "path";
import { createLogger, format, transports } from "winston";
const { combine, printf, json } = format;

const logDir = "logs";
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logger = createLogger({
  transports: [
    new transports.Console({
      format: combine(
        format.colorize(),
        printf(({ level, message }) => {
          const formattedMessage =
            typeof message === "object" ? JSON.stringify(message) : message;
          return `${level}: ${formattedMessage}`;
        }),
      ),
    }),
    new transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
      format: combine(json()),
    }),
    new transports.File({
      filename: path.join(logDir, "info.log"),
      level: "info", // Explicitly set to only capture info logs
      format: combine(
        printf(({ level, message }) => {
          if (level === "error") return "";
          return JSON.stringify({ level, message });
        }),
      ),
    }),
  ],
});

export default logger;
