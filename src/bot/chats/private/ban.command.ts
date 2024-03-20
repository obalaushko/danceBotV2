import { globalSession } from '../../../constants/global.js';
import {
    addToBlacklist,
    clearBlacklist,
    loadBlacklist,
    removeFromBlacklist,
} from '../../../utils/blackList.js';
import { hasAdminOrDevRole } from '../../../utils/utils.js';
import { privateChat } from '../../bot.js';

/**
 * Defines the ban command for private chats.
 */
export const banCommand = () => {
    privateChat.command('ban').filter(
        /**
         * Filters messages to ensure the command has the correct format: /ban <userId>
         * @param ctx The context object containing the message.
         * @returns True if the command has the correct format, false otherwise.
         */
        (ctx) => {
            const parts = ctx.message.text.split(' ');
            return parts.length === 2 && !isNaN(Number(parts[1]));
        },
        /**
         * Handles the ban command.
         * @param ctx The context object containing the message.
         */
        async (ctx) => {
            const userId = Number(ctx.message.text.split(' ')[1]);

            const { user } = await ctx.getAuthor();
            const accessRights = await hasAdminOrDevRole(user.id);
            if (!accessRights) return;

            const updateBlacklist = await addToBlacklist(userId);
            if (updateBlacklist) {
                globalSession.blackList = updateBlacklist;
            }

            await ctx.reply(`User ${userId} has been added to the blacklist.`);
        }
    );

    privateChat.command('unban').filter(
        /**
         * Filters messages to ensure the command has the correct format: /unban <userId>
         * @param ctx The context object containing the message.
         * @returns True if the command has the correct format, false otherwise.
         */
        (ctx) => {
            const parts = ctx.message.text.split(' ');
            return parts.length === 2 && !isNaN(Number(parts[1]));
        },
        /**
         * Handles the unban command.
         * @param ctx The context object containing the message.
         */
        async (ctx) => {
            const userId = Number(ctx.message.text.split(' ')[1]);

            const { user } = await ctx.getAuthor();
            const accessRights = await hasAdminOrDevRole(user.id);
            if (!accessRights) return;

            const updateBlacklist = await removeFromBlacklist(userId);

            if (updateBlacklist) {
                globalSession.blackList = updateBlacklist;
            }

            await ctx.reply(
                `User ${userId} has been removed from the blacklist.`
            );
        }
    );

    privateChat.command('allBaned', async (ctx) => {
        const { user } = await ctx.getAuthor();
        const accessRights = await hasAdminOrDevRole(user.id);
        if (!accessRights) return;

        const list = await loadBlacklist();
        await ctx.reply(
            `The blacklist contains the following users: ${list.join(', ')}`
        );
    });

    privateChat.command('clearBlacklist', async (ctx) => {
        const { user } = await ctx.getAuthor();
        const accessRights = await hasAdminOrDevRole(user.id);
        if (!accessRights) return;

        await clearBlacklist();
        globalSession.blackList = await loadBlacklist();

        await ctx.reply(`The blacklist has been cleared.`);
    });
};
