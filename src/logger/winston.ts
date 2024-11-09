import { ENV_VARIABLES } from './../constants/global.js';
import {
    createLogger,
    format,
    transports,
    LogEntry as WinstonLogEntry,
    LoggerOptions,
    Logger as WinstonLogger,
} from 'winston';

import TelegramLogger from 'winston-telegram';

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

const telegramTransport = new TelegramLogger({
    token: ENV_VARIABLES.TOKEN,
    chatId: ENV_VARIABLES.LOGGER_TELEGRAM_GROUP, //https://api.telegram.org/<BOT_TOKEN>/getUpdates
    disableNotification: true,
    batchingDelay: 1000,
    parseMode: 'HTML',
    formatMessage: (info) => {
        try {
            const level = info.level;
            const emoji =
                level === 'info' ? '🔆' : level === 'warn' ? '⚠️' : '❌';
            const output = `<b>${emoji} [${level.toUpperCase()}]</b>`;
            return `${output} ${info.message}: <pre>${
                info.metadata ? JSON.stringify(info.metadata, null, 2) : ''
            }</pre>`;
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error(`[error] ${err}`);
            return `[${info.level}] ${err}`;
        }
    },
});

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
        logger.add(telegramTransport);
        logger.add(new LogtailTransport(logtail, { level: 'debug' })); // https://logs.betterstack.com/team/218160/tail
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
    }
}

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

export { logger };
