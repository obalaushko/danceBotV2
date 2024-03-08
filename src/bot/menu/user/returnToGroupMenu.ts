import { ENV_VARIABLES } from './../../../constants/global';
import { Menu } from '@grammyjs/menu';
import { MSG } from '../../../constants/messages.js';
import {
    getUserById,
    updateInactiveToGuest,
} from '../../../mongodb/operations/users.js';

import { LOGGER } from '../../../logger/index.js';

export const returnToGroupMenu = new Menu('returnToGroupMenu').text(
    MSG.buttons.user.returnToGroup,
    async (ctx) => {
        const { user } = await ctx.getAuthor();
        const checkUser = await getUserById(user.id);

        if (!checkUser) {
            await ctx.reply(MSG.commandDisabled);
            return;
        }

        const updateUser = await updateInactiveToGuest(user.id);

        if (updateUser) {
            await ctx.reply(MSG.welcome.restoreInactiveToUser);

            try {
                await ctx.api.sendMessage(
                    ENV_VARIABLES.ADMIN_ID,
                    MSG.returnOldUser(updateUser)
                );
            } catch (error) {
                LOGGER.error(
                    `[returnToGroupMenu]: Send admin message ${error}`
                );
            }
        }
    }
);
