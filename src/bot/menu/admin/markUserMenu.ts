import { Menu, MenuRange } from '@grammyjs/menu';
import { MSG } from '../../../constants/index.js';
import {
    getAllActiveUserUsers,
    markLessonAsUsed,
} from '../../../mongodb/operations/index.js';
import { LOGGER } from '../../../logger/index.js';

export const markUserMenu = new Menu('markUserMenu', {
    onMenuOutdated: MSG.onMenuOutdated,
});

const checked = new Set<number>();

const toggleChecked = (id: number) => {
    if (!checked.delete(id)) checked.add(id);
};

markUserMenu
    .webApp('scan', 'https://172.18.220.84:5173/')
    .dynamic(async () => {
        const users = await getAllActiveUserUsers();

        const range = new MenuRange();
        if (users?.length) {
            range.webApp('scan', 'https://172.18.220.84:5173/');
            users.map((user, index) => {
                range.text(
                    {
                        text: checked.has(user.userId)
                            ? `✔️ ${user.fullName!}`
                            : user.fullName!,
                        payload: user.userId.toString(),
                    },
                    (ctx) => {
                        toggleChecked(Number(ctx.match));

                        ctx.menu.update();
                    }
                );
                if (index % 2) range.row();
            });
            checked.size &&
                range
                    .text(MSG.buttons.update, async (ctx) => {
                        const userIds = [...checked];

                        const updateSubscriptions =
                            await markLessonAsUsed(userIds);

                        checked.clear();
                        if (updateSubscriptions?.length) {
                            LOGGER.info('[markUser]', {
                                metadata: updateSubscriptions,
                            });

                            const updatedUsers = users.filter((user) =>
                                updateSubscriptions.some(
                                    (updateUser) =>
                                        updateUser.userId === user.userId
                                )
                            );

                            ctx.menu.update();
                            await ctx.editMessageText(
                                MSG.chooseUserToMark(updatedUsers)
                            );
                        } else {
                            LOGGER.error('[markUser]', {
                                metadata: updateSubscriptions,
                            });
                            await ctx.reply(MSG.errors.failedToUpdate);
                        }
                    })
                    .row();
        }

        return range;
    })
    .row()
    .text(MSG.buttons.backToMain, async (ctx) => {
        const { user } = await ctx.getAuthor();
        ctx.menu.back();
        await ctx.editMessageText(MSG.welcome.admin(user));
        checked.clear();
    });
