import { BotContext, ConverstaionContext } from '../types';
import { LOGGER } from '../../logger';

const startConversation = async (
    conversation: ConverstaionContext,
    ctx: BotContext
) => {
    if (ctx.from === undefined) return;

    const { user } = await ctx.getAuthor();

    if (user.is_bot) return;

    const {role, approved} = ctx.session;

    LOGGER.info('[startConversation]', { metadata: user });

    ctx.reply(`Welcome ${user.first_name}, your role: ${role}, approved status: ${approved}`);
};

export { startConversation };
