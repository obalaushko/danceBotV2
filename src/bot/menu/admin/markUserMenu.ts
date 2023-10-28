import { Menu } from "@grammyjs/menu";
import { MSG } from "../../../constants";
import { getAllActiveUserUsers } from "../../../mongodb/operations";

export const markUserMenu = new Menu('markUserMenu', {
    onMenuOutdated: MSG.onMenuOutdated,
})

markUserMenu
.dynamic(async () => {
    const students = await getAllActiveUserUsers();

    console.log(students)
})
.text(MSG.buttons.backToMain, async (ctx) => {
    const { user } = await ctx.getAuthor();
    ctx.menu.back();
    await ctx.editMessageText(MSG.welcome.admin(user));
});