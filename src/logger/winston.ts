import { createLogger, format, transports } from 'winston';
import TelegramLogger from 'winston-telegram';
import * as dotenv from 'dotenv';

dotenv.config();

const LOGGER_BOT_TOKEN = process.env.LOGGER_BOT_TOKEN || '';
const mode = process.env.NODE_ENV || 'development';

const { combine, timestamp, json, errors } = format;
const errorsFormat = errors({ stack: true });

const telegramTransport = new TelegramLogger({
    token: LOGGER_BOT_TOKEN,
    chatId: -4022952026,
    disableNotification: true,
    batchingDelay: 1000,
    parseMode: 'HTML',
    formatMessage: (info) => {
        try {
            return `<b>[${info.level}]</b> ${info.message}: <pre>${
                info.metadata ? JSON.stringify(info.metadata) : ''
            }</pre>`;
        } catch (err) {
            console.error(`[error] ${err}`);
            return `[${info.level}] ${err}`;
        }
    },
});

const logger = createLogger();

if (mode === 'production') {
    logger.add(telegramTransport);
}

logger.add(
    new transports.Console({
        level: 'info',
        format: combine(timestamp(), json(), errorsFormat),
    })
);

export { logger };
