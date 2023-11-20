import { Bot, GrammyError, HttpError, session } from 'grammy';
// import { apiThrottler } from '@grammyjs/transformer-throttler';
import { limit } from '@grammyjs/ratelimiter';
import { hydrateReply, parseMode } from '@grammyjs/parse-mode';
import type { ParseModeFlavor } from '@grammyjs/parse-mode';

// import { globalConfig, groupConfig, outConfig } from './limitsConfig';
import { BotContext } from './types/index.js';
import { COMMANDS } from './commands/index.js';
import * as dotenv from 'dotenv';

import { conversations, createConversation } from '@grammyjs/conversations';
import { LOGGER } from '../logger/index.js';
import {
    changeNameConversations,
    registerConversations,
} from './conversations/index.js';
import { BOT_RIGHTS, MSG } from '../constants/index.js';
import { adminMenu, developerMenu, userMenu } from './menu/index.js';
import { dailyCheck } from '../helpers/index.js';
import {
    aboutCommand,
    cancelCommand,
    changeNameCommand,
    helpCommand,
    joinRequestHears,
    messageHears,
    startCommand,
} from './chats/index.js';
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

bot.api.setMyCommands([], { scope: { type: 'all_group_chats' } });
bot.api.setMyCommands(COMMANDS, { scope: { type: 'all_private_chats' } });
bot.api.setMyDescription(MSG.myDescriptions);
bot.api.setMyDefaultAdministratorRights({
    // https://core.telegram.org/bots/api#chatadministratorrights
    rights: BOT_RIGHTS,
});

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
            await ctx.reply(MSG.tooManyRequest);
        },

        // Note that the key should be a number in string format such as "123456789".
        keyGenerator: (ctx) => {
            return ctx.from?.id.toString();
        },
    })
);

bot.use(adminMenu);
bot.use(userMenu);
bot.use(developerMenu);

//Inject conversations
bot.use(conversations());
bot.use(createConversation(registerConversations));
// bot.use(createConversation(paymentDetailsConversations));
bot.use(createConversation(changeNameConversations));

dailyCheck();

export const privateChat = bot.chatType('private');
export const groupChat = bot.chatType(['group', 'supergroup']);

// Group
joinRequestHears();

//START COMMAND
// Private
startCommand();
// Always exit any conversation upon /cancel
cancelCommand();
changeNameCommand();
helpCommand();
aboutCommand();
messageHears();

// privateChat.command('updatePaymentDetails', async (ctx) => {
//     const { user } = await ctx.getAuthor();
//     if (user.is_bot) return;

//     const userExists = await getUserById(user.id);

//     if (
//         userExists?.role === ROLES.Admin ||
//         userExists?.role === ROLES.Developer
//     ) {
//         await ctx.conversation.enter('paymentDetailsConversations');
//     }
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
