import { Menu } from "@grammyjs/menu";
import { MSG } from "../../../constants/messages.js";
import { ENV_VARIABLES } from "../../../constants/global.js";

export const aboutMenu = new Menu("aboutMenu", {
    onMenuOutdated: MSG.onMenuOutdated,
})
.webApp(MSG.buttons.user.openWebApp, ENV_VARIABLES.URL + 'about')