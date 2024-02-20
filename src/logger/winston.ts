import { createLogger, format, transports } from 'winston';
// import TelegramLogger from 'winston-telegram';
import * as dotenv from 'dotenv';

dotenv.config();

// const LOGGER_BOT_TOKEN = process.env.LOGGER_BOT_TOKEN || '';
const mode = process.env.NODE_ENV || 'development';
const LOGTAIL_TOKEN = process.env.LOGTAIL_TOKEN || '';

import { Logtail } from '@logtail/node';
import { LogtailTransport } from '@logtail/winston';

const logtail = new Logtail(LOGTAIL_TOKEN);

const { combine, timestamp, colorize, printf } = format;
// const errorsFormat = errors({ stack: true });
const consoleFormat = printf(({ level, message, timestamp, metadata }) => {
    return `${timestamp} ${level}: ${message} ${
        metadata ? JSON.stringify(metadata, null, 2) : ''
    }`;
});

// const telegramTransport = new TelegramLogger({
//     token: LOGGER_BOT_TOKEN,
//     chatId: -4022952026, //https://api.telegram.org/<BOT_TOKEN>/getUpdates
//     disableNotification: true,
//     batchingDelay: 1000,
//     parseMode: 'HTML',
//     formatMessage: (info) => {
//         try {
//             return `<b>[${info.level}]</b> ${info.message}: <pre>${
//                 info.metadata ? JSON.stringify(info.metadata) : ''
//             }</pre>`;
//         } catch (err) {
//             console.error(`[error] ${err}`);
//             return `[${info.level}] ${err}`;
//         }
//     },
// });

const logger = createLogger({
    transports: [
        new transports.File({
            level: 'error',
            filename: 'app-error.log',
        }),
    ],
});

if (mode === 'production') {
    try {
        logger.add(new LogtailTransport(logtail)); // https://logs.betterstack.com/team/218160/tail
    } catch (err) {
        console.error(err);
    }
}

logger.add(
    new transports.Console({
        level: 'info',
        format: combine(
            colorize({ colors: { info: 'blue', error: 'red' }, level: true }),
            timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            consoleFormat
        ),
    })
);

export { logger };
