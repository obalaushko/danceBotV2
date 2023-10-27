import { Menu } from "@grammyjs/menu";
import { MSG } from "../../../constants";

export const markUserMenu = new Menu('admin', {
    onMenuOutdated: MSG.onMenuOutdated,
})