import winston from "winston";

// see: https://github.com/winstonjs/winston#logging
export function createLogger(name: string): winston.Logger {
  return winston.createLogger({
    level: "info",
    format: winston.format.json(),
    defaultMeta: { service: name },
    transports: [
      new winston.transports.Console({
        level: "info",
        format: winston.format.json(),
      }),
    ],
  });
}
