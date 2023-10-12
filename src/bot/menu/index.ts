import { Menu } from '@grammyjs/menu';
import UserModel from '../../mongodb/schemas/user';
import { BotContext } from '../types';

const startMenu = new Menu('start')
    .text('Start', (ctx) => ctx.reply('You press Start'))
    .text('End', (ctx) => ctx.reply('You press End'))
    .row()
    .submenu('Зареєструватися', 'register-menu');

const registerMenu = new Menu('register-menu')
    .text('Register', (ctx) => console.log('Register'))
    .text('Show user Data', async (ctx) => {
        const {
            user: { id },
        } = await ctx.getAuthor();
        const existingUser = await UserModel.findOne({ userId: id.toString() });
        
        ctx.editMessageText(
            `username: ${existingUser?.username}, id: ${existingUser?.userId}`
        );
    })
    .row()
    .back('Повернутися назад');

    

startMenu.register(registerMenu);

export default startMenu;
