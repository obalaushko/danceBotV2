import { Bot, GrammyError, HttpError, session } from 'grammy';
// import { apiThrottler } from '@grammyjs/transformer-throttler';
import { limit } from '@grammyjs/ratelimiter';
import { hydrateReply } from '@grammyjs/parse-mode';
import type { ParseModeFlavor } from '@grammyjs/parse-mode';

// import { globalConfig, groupConfig, outConfig } from './limitsConfig';
import { BotContext } from './types';
import { COMMANDS, startCommand } from './commands';
import * as dotenv from 'dotenv';

import { conversations, createConversation } from '@grammyjs/conversations';
import { LOGGER } from '../logger';
import { startConversation } from './conversations';
import startMenu from './menu';
import { addUser } from '../mongodb/operations';

dotenv.config();

//Env vars
const mode = process.env.NODE_ENV || 'development';
const BOT_TOKEN =
    mode === 'production'
        ? process.env.PRODUCTION_BOT_TOKEN || ''
        : process.env.DEVELOPMENT_BOT_TOKEN || '';

//BOT CONFIG
const bot = new Bot<ParseModeFlavor<BotContext>>(BOT_TOKEN);
// const throttler = apiThrottler({
//     global: globalConfig,
//     group: groupConfig,
//     out: outConfig,
// });

bot.api.setMyCommands(COMMANDS);
bot.use(hydrateReply);
// bot.api.config.use(throttler);
//bot.api.config.use(parseMode('')); // Sets default parse_mode for ctx.reply

// Session
bot.use(
    session({
        initial: () => ({}),
    })
);

// Create user in MongoDB
bot.use(async (ctx, next) => {
    const {
        user: { id, first_name, username },
    } = await ctx.getAuthor();

    if (id) {
        await addUser({
            userId: id,
            username: username || '',
            firstName: first_name || '',
        });
    }

    await next();
});

// Limit
bot.use(
    limit({
        // Allow only 3 messages to be handled every 2 seconds.
        timeFrame: 2000,
        limit: 3,

        // This is called when the limit is exceeded.
        onLimitExceeded: async (ctx) => {
            await ctx.reply('Please refrain from sending too many requests!');
        },

        // Note that the key should be a number in string format such as "123456789".
        keyGenerator: (ctx) => {
            return ctx.from?.id.toString();
        },
    })
);

// Menu
bot.use(startMenu);

//Inject conversations
bot.use(conversations());
bot.use(createConversation(startConversation));

//START COMMAND
bot.command('start', async (ctx) => {
    // await ctx.conversation.enter('startConversation');
    startCommand(ctx);
});

// Always exit any conversation upon /cancel
bot.command('cancel', async (ctx) => {
    await ctx.conversation.exit();
    await ctx.reply('Leaving...');
});

//CRASH HANDLER
bot.catch((err) => {
    const ctx = err.ctx;
    LOGGER.error(
        `[bot-catch][Error while handling update ${ctx.update.update_id}]`,
        { metadata: err.error }
    );
    const e = err.error;

    if (e instanceof GrammyError) {
        LOGGER.error(`[bot-catch][Error in request ${ctx.update.update_id}]`, {
            metadata: e.message,
            stack: e.stack,
        });
    } else if (e instanceof HttpError) {
        LOGGER.error(`[bot-catch][Error in request ${ctx.update.update_id}]`, {
            metadata: e.error,
            stack: e.stack,
        });
    } else {
        LOGGER.error(`[bot-catch][Error in request ${ctx.update.update_id}]`, {
            metadata: e,
        });
    }
});

export { bot };
