import winston, { Logger, LoggerOptions } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

export type LogLevels = "silly" | "debug" | "verbose" | "http" | "info" | "warn" | "error"
export function createLogger(options?: LoggerOptions, isProduction = false, logLevel: LogLevels = "info"): Logger {
  const transports: winston.transport[] = [];

  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.printf(
          ({ timestamp, level, message, ...meta }) =>
            `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ""
            }`,
        ),
      ),
    }),
  );

  if (isProduction) {
    transports.push(
      new DailyRotateFile({
        dirname: "logs",
        filename: "app-%DATE%.log",
        datePattern: "YYYY-MM-DD",
        maxSize: "20m",
        maxFiles: "14d",
        format: winston.format.json(),
      }),
    );

    transports.push(
      new DailyRotateFile({
        dirname: "logs",
        filename: "error-%DATE%.log",
        level: "error",
        datePattern: "YYYY-MM-DD",
        maxSize: "20m",
        maxFiles: "30d",
        format: winston.format.json(),
      }),
    );

    transports.push(
      new DailyRotateFile({
        dirname: "logs",
        filename: "info-%DATE%.log",
        level: "info",
        datePattern: "YYYY-MM-DD",
        maxSize: "20m",
        maxFiles: "14d",
        format: winston.format.json(),
      }),
    );
  }

  return winston.createLogger({
    level: logLevel,
    ...options,
    transports,
  });
}
