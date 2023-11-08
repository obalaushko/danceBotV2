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
    guestConversations,
    registerConversations,
} from './conversations/index.js';
import { getUserById } from '../mongodb/operations/index.js';
import { BOT_RIGHTS, MSG, ROLES } from '../constants/index.js';
import { isObjectEmpty } from '../utils/utils.js';
import { adminMenu, developerMenu, userMenu } from './menu/index.js';
import { dailyCheck } from '../helpers/index.js';

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
bot.use(createConversation(guestConversations));
// bot.use(createConversation(paymentDetailsConversations));
bot.use(createConversation(changeNameConversations));

dailyCheck();

const privateChat = bot.chatType('private');
const groupChat = bot.chatType(['group', 'supergroup']);

groupChat.on('chat_join_request', async (ctx) => {
    try {
        const {
            user_chat_id,
            from,
            invite_link,
            chat: { id },
        } = ctx.chatJoinRequest;

        const inviteLink = invite_link?.invite_link;

        const user = await getUserById(user_chat_id);

        const revokeLink = async () => {
            try {
                inviteLink &&
                    (await ctx.api.revokeChatInviteLink(id, inviteLink));
                if (user?.inviteLink) {
                    user.inviteLink = null;
                    await user.save();
                }
            } catch (err) {
                LOGGER.error('[revokeChatInviteLink]', { metadata: err });
            }
        };

        if (user?.approved && user.inviteLink === inviteLink) {
            const approved = await ctx.approveChatJoinRequest(user_chat_id);
            LOGGER.info('[approveChatJoinRequest] Approve user', {
                metadata: user,
            });

            if (approved) {
                LOGGER.info('[userDialogue]', { metadata: user });
                await ctx.api.sendMessage(user.userId, MSG.welcome.user(user), {
                    reply_markup: userMenu,
                });

                // Revoke
                revokeLink();
            } else {
                LOGGER.error(
                    '[approveChatJoinRequest] Something wrong with approve user',
                    {
                        metadata: ctx.chatJoinRequest,
                    }
                );
            }
        } else {
            await ctx.declineChatJoinRequest(user_chat_id);
            LOGGER.error('[declineChatJoinRequest] Decline user', {
                metadata: from,
            });

            // Revoke
            revokeLink();
        }
    } catch (err) {
        LOGGER.error('[chat_join_request]', { metadata: err });
    }
});

//START COMMAND
privateChat.command('start', async (ctx) => {
    const { user } = await ctx.getAuthor();

    if (user.is_bot) return;
    const userExists = await getUserById(user.id);

    if (!userExists) {
        await ctx.conversation.enter('registerConversations');
    } else if (userExists?.role === ROLES.Guest) {
        await ctx.conversation.enter('guestConversations');
    } else if (userExists?.role === ROLES.User) {
        LOGGER.info('[userDialogue]', { metadata: user });
        await ctx.reply(MSG.welcome.user(user), {
            reply_markup: userMenu,
        });
    } else if (userExists?.role === ROLES.Admin) {
        LOGGER.info('[adminDialogue]', { metadata: user });
        await ctx.reply(MSG.welcome.admin(user), {
            reply_markup: adminMenu,
        });
    } else if (userExists?.role === ROLES.Developer) {
        LOGGER.info('[developerDialogue]', { metadata: user });
        await ctx.reply(MSG.welcome.developer(user), {
            reply_markup: developerMenu,
        });
    } else if (userExists?.role == ROLES.Inactive) {
        await ctx.reply(MSG.deactivatedAccount);
    }
});

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

// Always exit any conversation upon /cancel
privateChat.command('cancel', async (ctx) => {
    const stats = await ctx.conversation.active();

    if (isObjectEmpty(stats)) {
        await ctx.reply(MSG.overLeaveConversation);
    } else {
        await ctx.conversation.exit();
        await ctx.reply(MSG.leaveConversation);
        LOGGER.info(`[guestConversations] Leave the conversation`);
    }
});

privateChat.command('changename', async (ctx) => {
    const {
        user: { is_bot, id },
    } = await ctx.getAuthor();

    if (is_bot) return;
    const userExists = await getUserById(id);

    if (userExists && userExists.role !== ROLES.Inactive) {
        await ctx.conversation.enter('changeNameConversations');
    } else {
        await ctx.reply(MSG.commandDisabled);
    }
});

privateChat.command('about', async (ctx) => {
    const {
        user: { is_bot },
    } = await ctx.getAuthor();

    if (is_bot) return;

    await ctx.reply(MSG.about);
});

privateChat.command('help', async (ctx) => {
    const {
        user: { is_bot },
    } = await ctx.getAuthor();

    if (is_bot) return;

    await ctx.reply(MSG.help);
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
