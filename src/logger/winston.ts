import { createLogger, format, transports } from 'winston';
// import TelegramLogger from 'winston-telegram';
import * as dotenv from 'dotenv';

dotenv.config();

// const LOGGER_BOT_TOKEN = process.env.LOGGER_BOT_TOKEN || '';
const mode = process.env.NODE_ENV || 'development';

import { Logtail } from '@logtail/node';
import { LogtailTransport } from '@logtail/winston';

const logtail = new Logtail('zKUX6WT9BKeWu5vUsd5WUU4s');

const { combine, timestamp, json, errors } = format;
const errorsFormat = errors({ stack: true });

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
        logger.add(new LogtailTransport(logtail));
    } catch (err) {
        console.error(err);
    }
}

logger.add(
    new transports.Console({
        level: 'info',
        format: combine(timestamp(), json(), errorsFormat),
    })
);

export { logger };
