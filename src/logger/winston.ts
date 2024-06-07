import { ENV_VARIABLES } from './../constants/global.js';
import {
    createLogger,
    format,
    transports,
    LogEntry as WinstonLogEntry,
    LoggerOptions,
    Logger as WinstonLogger,
} from 'winston';

import { Logtail } from '@logtail/node';
import { LogtailTransport } from '@logtail/winston';

const logtail = new Logtail(ENV_VARIABLES.LOGTAIL_TOKEN);

const { combine, timestamp, colorize, printf } = format;

interface Metadata {
    [key: string]: any;
}

interface LogEntry extends WinstonLogEntry {
    metadata?: Metadata;
}

const consoleFormat = printf(
    ({ level, message, timestamp, metadata }: LogEntry) => {
        return `${timestamp} ${level}: ${message} ${
            metadata ? JSON.stringify(metadata, null, 2) : ''
        }`;
    }
);

const loggerOptions: LoggerOptions = {
    transports: [
        new transports.File({
            level: 'error',
            filename: 'app-error.log',
        }),
    ],
};

const logger: WinstonLogger = createLogger(loggerOptions);

if (ENV_VARIABLES.MODE === 'production') {
    try {
        logger.add(new LogtailTransport(logtail, { level: 'debug' })); // https://logs.betterstack.com/team/218160/tail
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
    }
}
if (ENV_VARIABLES.MODE === 'development') {
    logger.add(
        new transports.Console({
            level: 'debug',
            format: combine(
                colorize({
                    colors: { info: 'blue', error: 'red' },
                    level: true,
                }),
                timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                consoleFormat
            ),
        })
    );
}

export { logger };
