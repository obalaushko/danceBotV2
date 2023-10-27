import { Bot, GrammyError, HttpError, session } from 'grammy';
// import { apiThrottler } from '@grammyjs/transformer-throttler';
import { limit } from '@grammyjs/ratelimiter';
import { hydrateReply, parseMode } from '@grammyjs/parse-mode';
import type { ParseModeFlavor } from '@grammyjs/parse-mode';

// import { globalConfig, groupConfig, outConfig } from './limitsConfig';
import { BotContext } from './types';
import { COMMANDS } from './commands';
import * as dotenv from 'dotenv';

import { conversations, createConversation } from '@grammyjs/conversations';
import { LOGGER } from '../logger';
import {
    changeNameConversations,
    developerConversations,
    guestConversations,
    registerConversations,
    userConversations,
} from './conversations';
import { getUserById } from '../mongodb/operations';
import { MSG, ROLES } from '../constants';
import { isObjectEmpty } from '../utils/utils';
import { adminMenu } from './menu';
import { dailyCheck } from '../helpers';

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
bot.api.config.use(parseMode('HTML')); // Sets default parse_mode for ctx.reply

// Session
bot.use(
    session({
        initial: () => ({}),
    })
);

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

bot.use(adminMenu);

//Inject conversations
bot.use(conversations());
bot.use(createConversation(registerConversations));
bot.use(createConversation(guestConversations));
bot.use(createConversation(userConversations));
// bot.use(createConversation(adminConversations));
bot.use(createConversation(developerConversations));
bot.use(createConversation(changeNameConversations));


dailyCheck();

//START COMMAND
bot.command('start', async (ctx) => {
    const { user } = await ctx.getAuthor();

    if (user.is_bot) return;
    const userExists = await getUserById(user.id);

    if (!userExists) {
        await ctx.conversation.enter('registerConversations');
    } else if (userExists?.role === ROLES.Guest) {
        await ctx.conversation.enter('guestConversations');
    } else if (userExists?.role === ROLES.User) {
        await ctx.conversation.enter('userConversations');
    } else if (userExists?.role === ROLES.Admin) {
        LOGGER.info('[adminDialogue]', { metadata: user });
        await ctx.reply(MSG.welcome.admin(user), {
            reply_markup: adminMenu,
        });
    } else if (userExists?.role === ROLES.Developer) {
        await ctx.conversation.enter('developerConversations');
    }
});

// Always exit any conversation upon /cancel
bot.command('cancel', async (ctx) => {
    const stats = await ctx.conversation.active();

    if (isObjectEmpty(stats)) {
        await ctx.reply(MSG.overLeaveConversation);
    } else {
        await ctx.conversation.exit();
        await ctx.reply(MSG.leaveConversation);
        LOGGER.info(`[guestConversations] Leave the conversation`);
    }
});

bot.command('changename', async (ctx) => {
    const {
        user: { is_bot, id },
    } = await ctx.getAuthor();

    if (is_bot) return;
    const userExists = await getUserById(id);
    if (!userExists) {
        await ctx.reply(MSG.commandDisabled);
    } else {
        await ctx.conversation.enter('changeNameConversations');
    }
});

bot.command('about', async (ctx) => {
    const {
        user: { is_bot },
    } = await ctx.getAuthor();

    if (is_bot) return;

    await ctx.reply(MSG.about);
});

bot.command('help', async (ctx) => {
    const {
        user: { is_bot },
    } = await ctx.getAuthor();

    if (is_bot) return;

    await ctx.reply(MSG.help, { parse_mode: 'HTML' });
});

// bot.command('add', async (ctx) => {
//     const {
//         user: { is_bot },
//     } = await ctx.getAuthor();

//     if (is_bot) return;

//     function generateRandomNumericId() {
//         const min = 10000000; // Мінімальне 8-цифрове число
//         const max = 99999999; // Максимальне 8-цифрове число
//         return Math.floor(Math.random() * (max - min + 1)) + min;
//     }

//     // Приклад використання
//     const randomId = generateRandomNumericId();
//     const subscription = await addSubscription({
//         userId: randomId,
//     });

//     const user = await addUser({
//         userId: randomId,
//         username: 'testuser2',
//         firstName: 'testuser2',
//         fullName: 'Test User2',
//         subscription: subscription,
//     });
// });

//CRASH HANDLER
bot.catch((err) => {
    const ctx = err.ctx;
    LOGGER.error(
        `[bot-catch][Error while handling update ${ctx.update.update_id}]`,
        { metadata: err.error }
    );
    const e = err.error;

    if (e instanceof GrammyError) {
        LOGGER.error(
            `[bot-catch][GrammyError][Error in request ${ctx.update.update_id}]`,
            {
                metadata: e.message,
                stack: e.stack,
            }
        );
    } else if (e instanceof HttpError) {
        LOGGER.error(
            `[bot-catch][HttpError][Error in request ${ctx.update.update_id}]`,
            {
                metadata: e.error,
                stack: e.stack,
            }
        );
    } else {
        LOGGER.error(`[bot-catch][Error in request ${ctx.update.update_id}]`, {
            metadata: e,
        });
    }
});

export { bot };
