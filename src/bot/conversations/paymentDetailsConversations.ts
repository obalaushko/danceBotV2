import { MSG } from '../../constants/index.js';
import { LOGGER } from '../../logger/index.js';
import { getPaymentDetailsExist } from '../../mongodb/operations/index.js';
import { isCancel } from '../../utils/utils.js';
import { BotContext, ConverstaionContext } from '../types/index.js';

export const paymentDetailsConversations = async (
    conversation: ConverstaionContext,
    ctx: BotContext
) => {
    const { user } = await ctx.getAuthor();
    LOGGER.info('[paymentDetailsConversations]', { metadata: user });

    const userWithPayment = await conversation.external(
        async () => await getPaymentDetailsExist(user.id)
    );

    console.log(userWithPayment);
    if (userWithPayment) {
        // update
    } else {
        // create
        // const newDetails = await conversation.external(
        //     async () => await createPaymentDetails()
        // );

        let isValidFormatBank = false;
        let isValidFormatCard = false;
        let bankName = '';
        let cardNumber = '';

        await ctx.reply(MSG.payments.createBank);

        while (!isValidFormatBank) {
            const { message } = await conversation.waitFor('message:text');
            const messageText = message?.text;

            if (isCancel(messageText || '')) {
                await ctx.reply(MSG.leaveConversation);
                await ctx.conversation.exit();
                LOGGER.info(
                    `[paymentDetailsConversations] Leave the conversation`
                );
                return;
            }

            if (messageText) {
                const inputRegex = /^(privatbank|monobank)$/;
                const match = inputRegex.exec(messageText);

                if (match) {
                    bankName = messageText;
                    isValidFormatBank = true;
                } else {
                    await ctx.reply(MSG.payments.wrongEnterBank);
                }
            }
        }

        await ctx.reply(MSG.payments.createCard);

        while (!isValidFormatCard) {
            const { message } = await conversation.waitFor('message:text');
            const messageText = message?.text;

            if (isCancel(messageText || '')) {
                await ctx.reply(MSG.leaveConversation);
                await ctx.conversation.exit();
                LOGGER.info(
                    `[paymentDetailsConversations] Leave the conversation`
                );
                return;
            }

            if (messageText) {
                const inputRegex = /^(\d{16}|\d{4} \d{4} \d{4} \d{4})$/;
                const match = inputRegex.exec(messageText);

                if (match) {
                    cardNumber = messageText.replace(/ /g, '');
                    isValidFormatCard = true;
                } else {
                    await ctx.reply(MSG.payments.wrongEnterCard);
                }
            }
        }

        if (isValidFormatBank && isValidFormatCard) {
            LOGGER.info(
                `[paymentDetailsConversations] Bank & Card: ${bankName} ${cardNumber}`
            );
        }
    }

    return;
};
