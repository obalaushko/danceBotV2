import { Menu } from '@grammyjs/menu';
import { MSG } from '../../../constants/messages.js';
import { ENV_VARIABLES } from '../../../constants/global.js';

export const aboutUserMenu = new Menu('aboutUserMenu', {
    onMenuOutdated: MSG.onMenuOutdated,
}).webApp(MSG.buttons.user.openWebApp, ENV_VARIABLES.URL + 'user/about');
export const aboutAdminMenu = new Menu('aboutAdminMenu', {
    onMenuOutdated: MSG.onMenuOutdated,
}).webApp(MSG.buttons.user.openWebApp, ENV_VARIABLES.URL + 'about');
