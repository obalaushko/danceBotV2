import { BotContext, ConverstaionContext } from '../types';
import { LOGGER } from '../../logger';
import { InlineKeyboard } from 'grammy';
import { getUserById } from '../../mongodb/operations';
import { MSG, ROLES } from '../../constants';
// import { inlineKeyboard } from '../menu';

const startConversation = async (
    conversation: ConverstaionContext,
    ctx: BotContext
) => {
    const { user } = await ctx.getAuthor();

    if (user.is_bot) return;

    LOGGER.info('[startConversation]', { metadata: user });

    const inlineKeyboard = new InlineKeyboard()
        .text('Реєстрація', 'click-register')
        .text('End', 'click-end');

    // check User
    const userExists = await conversation.external(
        async () => await getUserById(user.id)
    );


    // await ctx.reply(`Welcome ${user.first_name}, your id: ${user.id}`, {
    //     reply_markup: inlineKeyboard,
    // });

    // const response = await conversation.waitForCallbackQuery('click-register', {
    //     otherwise: (ctx) =>
    //       ctx.reply("Використовуйте кнопки!", { reply_markup: inlineKeyboard }),
    //   });
};

export { startConversation };
