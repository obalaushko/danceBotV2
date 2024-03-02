import { ENV_VARIABLES } from './../constants/global';
import { createLogger, format, transports } from 'winston';

import { Logtail } from '@logtail/node';
import { LogtailTransport } from '@logtail/winston';

const logtail = new Logtail(ENV_VARIABLES.LOGTAIL_TOKEN);

const { combine, timestamp, colorize, printf } = format;
// const errorsFormat = errors({ stack: true });
const consoleFormat = printf(({ level, message, timestamp, metadata }) => {
    return `${timestamp} ${level}: ${message} ${
        metadata ? JSON.stringify(metadata, null, 2) : ''
    }`;
});

const logger = createLogger({
    transports: [
        new transports.File({
            level: 'error',
            filename: 'app-error.log',
        }),
    ],
});

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
// else if (mode === 'production') {
//     logger.add(
//         new transports.Console({
//             level: 'info',
//             format: combine(timestamp(), json(), errorsFormat),
//         })
//     );
// }

export { logger };
