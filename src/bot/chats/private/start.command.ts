import { ROLES } from '../../../constants/global.js';
import { MSG } from '../../../constants/messages.js';
import { LOGGER } from '../../../logger/index.js';
import { getUserById } from '../../../mongodb/operations/users.js';
import { privateChat } from '../../bot.js';
import { adminMenu, developerMenu, userMenu } from '../../menu/index.js';
import { returnToGroupMenu } from '../../menu/user/returnToGroupMenu.js';

export const startCommand = () => {
    privateChat.command('start', async (ctx) => {
        const { user } = await ctx.getAuthor();

        if (user.is_bot) return;
        const userExists = await getUserById(user.id);

        if (!userExists) {
            await ctx.conversation.enter('registerConversations');
        } else if (userExists?.role === ROLES.Guest) {
            LOGGER.info('[guestConversations]', { metadata: user });
            await ctx.reply(MSG.waitAssigned);
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
            await ctx.reply(MSG.deactivatedAccount, {
                reply_markup: returnToGroupMenu,
            });
        }
    });
};
