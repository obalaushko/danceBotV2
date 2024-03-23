import { Menu } from '@grammyjs/menu';
import { MSG } from '../../../constants/index.js';
import { getGroupedSubscriptionChanges } from '../../../mongodb/operations/changeLog.js';
import { sendMailingToUsers } from '../../../helpers/notifications.js';
import { ENV_VARIABLES } from '../../../constants/global.js';

// History menu
const settingHistoryMenu = new Menu('settingHistoryMenu', {
    onMenuOutdated: MSG.onMenuOutdated,
})
    .row()
    .text(MSG.buttons.back, async (ctx) => {
        ctx.menu.back();
        await ctx.editMessageText(MSG.settings.main);
    })
    .text(MSG.buttons.backToMain, async (ctx) => {
        const { user } = await ctx.getAuthor();
        ctx.menu.nav('admin');
        await ctx.editMessageText(MSG.welcome.admin(user));
    });

const confirmMailingMenu = new Menu('confirmMailingMenu', {
    onMenuOutdated: MSG.onMenuOutdated,
})
    .text(MSG.buttons.send, async (ctx) => {
        await sendMailingToUsers(MSG.payments.updatedStatic);
        ctx.menu.back();
        await ctx.editMessageText(MSG.settings.mailing.main);
    })
    .text(MSG.buttons.cancel, async (ctx) => {
        ctx.menu.back();
        await ctx.editMessageText(MSG.settings.mailing.main);
    });

// Mailing menu
const mailingMenu = new Menu('mailingMenu', {
    onMenuOutdated: MSG.onMenuOutdated,
})
    .text(MSG.buttons.settings.mailing.custom, async (ctx) => {
        // ctx.menu.nav('confirmMailingMenu');
        ctx.menu.close();
        await ctx.editMessageText(MSG.settings.mailing.custom);
    })
    .row()
    .text(MSG.buttons.back, async (ctx) => {
        ctx.menu.back();
        await ctx.editMessageText(MSG.settings.main);
    })
    .text(MSG.buttons.backToMain, async (ctx) => {
        const { user } = await ctx.getAuthor();
        ctx.menu.nav('admin');
        await ctx.editMessageText(MSG.welcome.admin(user));
    });
mailingMenu.register(confirmMailingMenu);

// Main menu
export const settingsMenu = new Menu('settingsMenu', {
    onMenuOutdated: MSG.onMenuOutdated,
})
    .webApp(MSG.buttons.settings.users, ENV_VARIABLES.URL + 'settings')
    .text(MSG.buttons.settings.history, async (ctx) => {
        const history = await getGroupedSubscriptionChanges();

        ctx.menu.nav('settingHistoryMenu');
        await ctx.editMessageText(MSG.settings.history(history));
    })
    // .row()
    // .text(MSG.buttons.settings.mailing.main, async (ctx) => {
    //     ctx.menu.nav('mailingMenu');
    //     await ctx.editMessageText(MSG.settings.mailing.main);
    // })

    // .row()
    // .webApp('history', ENV_VARIABLES.URL + 'history')
    .row()
    .text(MSG.buttons.backToMain, async (ctx) => {
        const { user } = await ctx.getAuthor();
        ctx.menu.back();
        await ctx.editMessageText(MSG.welcome.admin(user));
    });

settingsMenu.register(settingHistoryMenu);
settingsMenu.register(mailingMenu);
