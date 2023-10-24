import { Menu } from '@grammyjs/menu';
import { getUserById } from '../../mongodb/operations';

export const startMenu = new Menu('start')
    .submenu('Зареєструватися', 'register-menu')
    .row()
    .text('Start', (ctx) => ctx.reply('You press Start'))
    .text('End', (ctx) => ctx.reply('You press End'));

const registerMenu = new Menu('register-menu')
    .text('Register', (ctx) => console.log('Register'))
    .text('Show user Data', async (ctx) => {
        const {
            user: { id },
        } = await ctx.getAuthor();
        const user = await getUserById(id);

        if (user) {
            ctx.editMessageText(
                `username: ${user.username}, id: ${user.userId}`
            );
        }
    })
    .row()
    .back('Повернутися назад');

startMenu.register(registerMenu);
