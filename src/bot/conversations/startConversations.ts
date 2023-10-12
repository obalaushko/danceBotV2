import { BotContext, ConverstaionContext } from '../types';
import { LOGGER } from '../../logger';
import startMenu from '../menu';

const startConversation = async (
    conversation: ConverstaionContext,
    ctx: BotContext
) => {
    if (ctx.from === undefined) return;

    const { user } = await ctx.getAuthor();

    if (user.is_bot) return;

    const { role, approved } = ctx.session;

    LOGGER.info('[startConversation]', { metadata: user });

    ctx.reply(
        `Welcome ${user.first_name}, your role: ${role}, approved status: ${approved}`,
        { reply_markup: startMenu }
    );


    
};

export { startConversation };
