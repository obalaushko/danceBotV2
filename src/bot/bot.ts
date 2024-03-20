/**
 * This file contains the implementation of a Telegram bot using the 'grammy' library.
 * It sets up the bot, configures various middleware, and defines the bot's behavior.
 * The bot handles commands, conversations, rate limiting, session management, and error handling.
 * It also includes menu functionality, blacklist management, and cron tasks.
 * The file exports the configured bot instance.
 */
import { Bot, GrammyError, HttpError, session } from 'grammy';
// import { apiThrottler } from '@grammyjs/transformer-throttler';
import { limit } from '@grammyjs/ratelimiter';
import { hydrateReply, parseMode } from '@grammyjs/parse-mode';
import type { ParseModeFlavor } from '@grammyjs/parse-mode';
import { hydrate } from '@grammyjs/hydrate';

// import { globalConfig, groupConfig, outConfig } from './limitsConfig';
import { BotContext } from './types/index.js';
import { COMMANDS } from './commands/index.js';

import { conversations, createConversation } from '@grammyjs/conversations';
import { LOGGER } from '../logger/index.js';
import {
    changeNameConversations,
    registerConversations,
} from './conversations/index.js';
import { BOT_RIGHTS, MSG } from '../constants/index.js';
import { adminMenu, developerMenu, userMenu } from './menu/index.js';
import {
    aboutCommand,
    cancelCommand,
    changeNameCommand,
    helpCommand,
    groupRequestHears,
    startCommand,
} from './chats/index.js';
import { tasksCron } from '../helpers/tasksCron.js';
import { autoRetry } from '@grammyjs/auto-retry';
import { cryptoCommand } from '../crypto/client/command.crypto.js';
import { hydrateFiles } from '@grammyjs/files';
import { cryptoConversations } from '../crypto/client/cryptoConversations.js';
import { ENV_VARIABLES, globalSession } from '../constants/global.js';
import { addToBlacklist, loadBlacklist } from '../utils/blackList.js';
import { banCommand } from './chats/private/ban.command.js';
// import { ignoreOld } from 'grammy-middlewares';

//BOT CONFIG
const bot = new Bot<ParseModeFlavor<BotContext>>(ENV_VARIABLES.TOKEN);

bot.api.config.use(
    autoRetry({
        maxRetryAttempts: 2,
        maxDelaySeconds: 10,
    })
);
// const throttler = apiThrottler({
//     global: globalConfig,
//     group: groupConfig,
//     out: outConfig,
// });

try {
    await bot.api.setMyCommands([], { scope: { type: 'all_group_chats' } });
    await bot.api.setMyCommands(COMMANDS, {
        scope: { type: 'all_private_chats' },
    });
    await bot.api.setMyDescription(MSG.myDescriptions);
    await bot.api.setMyDefaultAdministratorRights({
        // https://core.telegram.org/bots/api#chatadministratorrights
        rights: BOT_RIGHTS,
    });
} catch (error) {
    LOGGER.error('[setBotApi]', { metadata: error });
}

bot.use(hydrateReply);
bot.use(hydrate());
bot.api.config.use(hydrateFiles(bot.token));
// bot.api.config.use(throttler);
bot.api.config.use(parseMode('HTML')); // Sets default parse_mode for ctx.reply

// Session
bot.use(
    session({
        initial: () => ({ spamCounter: 0 }),
    })
);

// Blacklist
bot.use(async (ctx, next) => {
    if (ctx.chat?.type === 'private') {
        if (!globalSession.blackList.length) {
            globalSession.blackList = await loadBlacklist();
        }
        if (ctx.from && globalSession.blackList.includes(ctx.from.id)) {
            // User is in blacklist, ignore their messages
            return;
        }

        // Add spammers to the blacklist
        if (ctx.session.spamCounter >= 3) {
            const { user } = await ctx.getAuthor();
            if (user.id) {
                const updateBlacklist = await addToBlacklist(user.id);
                ctx.session.spamCounter = 0;
                await ctx.reply(MSG.spamWarning);

                if (updateBlacklist) {
                    globalSession.blackList = updateBlacklist;
                    return;
                }
            }
        }
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
            if (ctx.chat?.type === 'private') {
                await ctx.reply(MSG.tooManyRequest);
                ctx.session.spamCounter += 1;

                if (ctx.session.spamCounter > 0) {
                    // Avoid negative values
                    setTimeout(
                        () => {
                            ctx.session.spamCounter -= 1;
                        },
                        1000 * 60 * 60
                    );
                }
            }
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
bot.use(createConversation(cryptoConversations));
bot.use(createConversation(changeNameConversations));

tasksCron();

export const privateChat = bot.chatType('private');
export const groupChat = bot.chatType(['group', 'supergroup']);

// Group
groupRequestHears();

// Crypto
cryptoCommand();

//START COMMAND
// Private
startCommand();
// Always exit any conversation upon /cancel
cancelCommand();
changeNameCommand();
helpCommand();
aboutCommand();
banCommand();

//CRASH HANDLER
bot.catch((err) => {
    const ctx = err.ctx;
    LOGGER.error(
        `[bot-catch][Error while handling update ${ctx.update.update_id}]`,
        { metadata: err }
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
