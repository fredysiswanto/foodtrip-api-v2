import winston from 'winston';
import { loggingConfig } from '@config/index';

/**
 * Winston logger instance with console and file transport
 * Used throughout the application for structured logging
 */
const logger = winston.createLogger({
  level: loggingConfig.level,
  format:
    loggingConfig.format === 'json'
      ? winston.format.combine(
          winston.format.timestamp(),
          winston.format.errors({ stack: true }),
          winston.format.json()
        )
      : winston.format.combine(
          winston.format.timestamp(),
          winston.format.errors({ stack: true }),
          winston.format.printf(
            ({ timestamp, level, message, ...meta }: Record<string, unknown>) => {
              const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
              return `${String(timestamp)} [${String(level).toUpperCase()}] ${String(message)} ${metaStr}`;
            }
          )
        ),
  transports: [
    new winston.transports.Console({
      format:
        loggingConfig.format === 'json'
          ? winston.format.combine(
              winston.format.colorize(),
              winston.format.printf(({ timestamp, level, message }: Record<string, unknown>) => {
                return `${String(timestamp)} [${String(level)}] ${String(message)}`;
              })
            )
          : winston.format.simple(),
    }),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

export default logger;
