import { ROLES } from '../../../constants/global.js';
import { MSG } from '../../../constants/messages.js';
import { LOGGER } from '../../../logger/index.js';
import { getUserById } from '../../../mongodb/operations/users.js';
import { privateChat } from '../../bot.js';
import { aboutAdminMenu, aboutUserMenu } from '../../menu/user/aboutMenu.js';

/**
 * Defines the 'about' command for private chats.
 * This command sends a message with information about the bot.
 */
export const aboutCommand = () => {
    privateChat.command('about', async (ctx) => {
        const {
            user: { id, is_bot },
        } = await ctx.getAuthor();

        if (is_bot) return;
        try {
            const user = await getUserById(id);
            if (user?.role === ROLES.Admin || user?.role === ROLES.Developer) {
                await ctx.reply(MSG.about.admin, {
                    reply_markup: aboutAdminMenu,
                });
            } else if (user?.role === ROLES.User) {
                await ctx.reply(MSG.about.user, {
                    reply_markup: aboutUserMenu,
                });
            } else {
                await ctx.reply(MSG.about.general);
            }
        } catch (error) {
            LOGGER.error('[aboutCommand]', { metadata: error });
        }
    });
};
