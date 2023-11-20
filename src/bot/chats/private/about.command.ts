import { MSG } from '../../../constants/messages.js';
import { privateChat } from '../../bot.js';

export const aboutCommand = () => {
    privateChat.command('about', async (ctx) => {
        const {
            user: { is_bot },
        } = await ctx.getAuthor();

        if (is_bot) return;

        await ctx.reply(MSG.about);
    });
};
