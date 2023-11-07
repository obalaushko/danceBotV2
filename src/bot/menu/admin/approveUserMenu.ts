import { Menu, MenuRange } from '@grammyjs/menu';
import { MSG } from '../../../constants';
import { approveUsers, getAllGuestUsers } from '../../../mongodb/operations';
import { LOGGER } from '../../../logger';
import { sendInviteToGroup } from '../../../helpers';

const checked = new Set<number>();

const toggleChecked = (id: number) => {
    if (!checked.delete(id)) checked.add(id);
};

export const approveUserMenu = new Menu('approveUserMenu', {
    onMenuOutdated: MSG.onMenuOutdated,
});

approveUserMenu
    .dynamic(async (ctx) => {
        const guestUsers = await getAllGuestUsers();

        const range = new MenuRange();
        if (guestUsers?.length) {
            guestUsers.map((user) => {
                range
                    .text(
                        {
                            text: checked.has(user.userId)
                                ? `${user.fullName!} ✔️`
                                : user.fullName!,
                            payload: user.userId.toString(),
                        },
                        (ctx) => {
                            toggleChecked(Number(ctx.match));

                            ctx.menu.update();
                        }
                    )
                    .row();
            });

            checked.size &&
                range.text(MSG.buttons.add, async (ctx) => {
                    const users = [...checked];

                    const updateUsers = await approveUsers(users);

                    if (updateUsers?.length) {
                        let updateText = '';

                        updateUsers.forEach(
                            (item) => (updateText += MSG.approved(item) + '\n')
                        );

                        await ctx.editMessageText(updateText);
                        checked.clear();

                        await sendInviteToGroup(updateUsers);

                        LOGGER.info('[approveUsers]', {
                            metadata: updateUsers,
                        });
                    } else {
                        LOGGER.error('[approveUsers]', {
                            metadata: updateUsers,
                        });
                        await ctx.reply(MSG.errors.failedToUpdate);
                    }
                });
        }

        return range;
    })
    .text(MSG.buttons.backToMain, async (ctx) => {
        const { user } = await ctx.getAuthor();
        ctx.menu.back();
        await ctx.editMessageText(MSG.welcome.admin(user));
        checked.clear();
    });
