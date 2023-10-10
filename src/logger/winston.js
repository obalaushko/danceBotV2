import { createLogger, format, transports } from 'winston';
const { combine, timestamp, json, errors } = format;
const errorsFormat = errors({ stack: true });
const logger = createLogger({
    level: 'info',
    exitOnError: false,
    format: json(),
    transports: [
        new transports.Console({
            format: combine(timestamp(), json(), errorsFormat),
        }),
    ],
});
export { logger };
