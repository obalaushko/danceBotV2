import { LOGGER } from '../../logger';
import { Menu, MenuRange } from '@grammyjs/menu';
import { MSG } from '../../constants';
import { BotContext } from '../types';
import { Context } from 'grammy';
import { getAllGuestUsers } from '../../mongodb/operations';

interface CreatedMenus {
    [menuName: string]: boolean;
}

const createdMenus: CreatedMenus = {};

const isMenuCreated = (menuName: string): boolean => {
    return createdMenus.hasOwnProperty(menuName);
};

const createMenu = (menuName: string): void => {
    createdMenus[menuName] = true;
};

const approveUserMenu = new Menu('approveUserMenu', {
    onMenuOutdated: MSG.onMenuOutdated,
});

approveUserMenu
    .dynamic(async (ctx) => {
        const guestUsers = await getAllGuestUsers();
        // console.log(ctx)
        // await ctx.editMessageText(
        //     'Виберіть користувачів яких хочете додати до групи'
        // );
        const range = new MenuRange();
        guestUsers!.map((user) => {
            range
                .text(
                    {
                        text: user.fullName!,
                        payload: user.userId.toString(),
                    },
                    (ctx) => {
                        console.log(ctx.match);
                    }
                )
                .row();
        });

        return range;
    })
    .text(MSG.buttons.backToMain, async (ctx) => {
        const { user } = await ctx.getAuthor();
        ctx.menu.back();
        await ctx.editMessageText(MSG.welcome.admin(user));
    });

export const adminDialogue = async (ctx: BotContext) => {
    const { user } = await ctx.getAuthor();

    LOGGER.info('[adminDialogue]', { metadata: user });

    await ctx.reply(MSG.welcome.admin(user), {
        reply_markup: adminMenu,
    });

    const handleMarkUser = async (ctx: Context) => {
        console.log('handleMarkUser');
    };

    const handleShowAllUsers = async (ctx: Context) => {
        console.log('handleShowAllUsers');
    };

    const handleUpdateUsers = async (ctx: Context) => {
        console.log('handleUpdateUsers');
    };

    const handleRemoveUsers = async (ctx: Context) => {
        console.log('handleRemoveUsers');
    };
};

export const adminMenu = new Menu('admin')
    .submenu(MSG.buttons.admin.approveUser, 'approveUserMenu')
    .submenu(MSG.buttons.admin.markUser, 'markUserMenu')
    .row()
    .submenu(MSG.buttons.admin.showAllUser, 'showUserMenu')
    .submenu(MSG.buttons.admin.updateUser, 'updateUserMenu')
    .row()
    .submenu(MSG.buttons.admin.removeUser, 'removeUserMenu');

adminMenu.register(approveUserMenu);
