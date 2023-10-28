import { Menu } from "@grammyjs/menu";
import { MSG } from "../../../constants";

export const updateSubscriptionMenu = new Menu('updateSubscriptionMenu', {
    onMenuOutdated: MSG.onMenuOutdated,
})

updateSubscriptionMenu
.text(MSG.buttons.updateSubscription.activate, async (ctx) => {
    
})
.text(MSG.buttons.updateSubscription.deactivate, async (ctx) => {

})
.row()
.text(MSG.buttons.backToMain, async (ctx) => {
    const { user } = await ctx.getAuthor();
    ctx.menu.back();
    await ctx.editMessageText(MSG.welcome.admin(user));
});