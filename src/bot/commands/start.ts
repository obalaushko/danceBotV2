import { Context } from "grammy";
import { LOGGER } from "../../logger";
import startMenu from "../menu";
import { getUserById } from "../../mongodb/operations";
import { Menu } from "@grammyjs/menu";

export const startCommand = async (ctx: Context) => {
    
    if (ctx.from === undefined) return;

    const { user } = await ctx.getAuthor();

    if (user.is_bot) return;
    LOGGER.info('[startCommand]', { metadata: user });


    ctx.reply(`Welcome ${user.first_name}, your id: ${user.id}`, {
        reply_markup: startMenu,
    });

    const showUserData = async (ctx: Context) => {
        const {
            user: { id },
        } = await ctx.getAuthor();
        const user = await getUserById(id);

        if (user) {
            ctx.editMessageText(
                `username: ${user.username}, id: ${user.userId}`
            );
        }
    }

    const registerMenu = new Menu('register-menu')
        .text('Register', (ctx) => console.log('Register'))
        .text('Show user Data', async (ctx) => showUserData(ctx))
        .row()
        .back('Повернутися назад');

    startMenu.register(registerMenu);
}