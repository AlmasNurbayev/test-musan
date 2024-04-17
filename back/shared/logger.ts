import winston from 'winston';

const { combine, timestamp, colorize, printf } = winston.format;
export const Logger = winston.createLogger({
  //level: process.env.LOG_LEVEL || 'info',
  format: combine(
    colorize({ level: true }),
    timestamp({
      format: 'YYYY-MM-DD hh:mm:ss.SSS',
    }),
    printf(
      (info) => `${info.level}: ${info.timestamp}:  ${JSON.stringify(info.message)}`,
    ),
  ),
  //format: winston.format.cli(),
  transports: [new winston.transports.Console()],
});
