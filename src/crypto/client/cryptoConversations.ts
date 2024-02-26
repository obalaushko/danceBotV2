import { InputFile, Keyboard } from 'grammy';
import { BotContext, ConverstaionContext } from '../../bot/types/index.js';
import { LOGGER } from '../../logger/index.js';
import { CMSG } from './constants/index.js';
import { encrypt } from '../core/encrypt.js';
import { writeToFile } from '../core/file.manager.js';

const keyboard = new Keyboard()
    .text(CMSG.buttons.encrypt)
    .text(CMSG.buttons.decrypt)
    .row()
    .text(CMSG.buttons.cancel)
    .resized();

export const cryptoConversations = async (
    conversation: ConverstaionContext,
    ctx: BotContext
) => {
    /**
     * Leaves the current conversation in the cryptography mode.
     * @param message - The message received from the user.
     */
    const leaveConversation = async (message: string) => {
        try {
            if (
                message &&
                (message === CMSG.commands.cancel ||
                    message === CMSG.buttons.cancel)
            ) {
                await ctx.reply(CMSG.text.cancel, {
                    reply_markup: { remove_keyboard: true },
                });
                return;
            }
        } catch (error) {
            LOGGER.error('[cryptoConversations][leaveConversation]', {
                metadata: error,
            });
        }
    };

    await ctx.reply(CMSG.text.start, { reply_markup: keyboard });

    const { message } = await conversation.waitFor('message:text');

    const messageText = message?.text;
    await selectMode(messageText);

    /**
     * Selects the mode of the crypto conversation based on the original message.
     * Leaves the current conversation and handles encryption or decryption based on the original message.
     * @param originalMessage The original message received from the user.
     */
    async function selectMode(originalMessage: string) {
        await leaveConversation(originalMessage);

        if (originalMessage === CMSG.buttons.encrypt) {
            await handleEncryption(ctx, conversation);
        }
        if (originalMessage === CMSG.buttons.decrypt) {
            await handleDecryption(ctx, conversation);
        }
    }

    /**
     * Handles the encryption process.
     *
     * @param ctx - The BotContext object.
     * @param conversation - The ConverstaionContext object.
     * @returns A Promise that resolves when the encryption process is completed.
     */
    async function handleEncryption(
        ctx: BotContext,
        conversation: ConverstaionContext
    ) {
        const buttonsValues = Object.values(CMSG.buttons);
        await ctx.reply(CMSG.text.encrypt);

        // password or buttons
        const { message: passOrText } =
            await conversation.waitFor('message:text');
        const password = passOrText.text;

        if (buttonsValues.some((button) => password.includes(button))) {
            await selectMode(password);
        } else {
            // TODO: Investigate out why it doesn't work after deleting in this way, the next message sent by the user gives an error
            // await passOrText.delete().catch((error) => {
            //     LOGGER.error('[cryptoConversations][selectMode][delete]', {
            //         metadata: error,
            //     });
            // });

            // Remove the password message
            ctx.chat?.id &&
                (await ctx.api.deleteMessage(
                    ctx.chat?.id,
                    passOrText.message_id
                ));

            await ctx.reply(CMSG.text.removePassword);

            const fileOrText = await conversation.waitFor([
                ':document',
                'message:text',
            ]);
            const buttonsText = fileOrText.message?.text || '';

            if (buttonsValues.some((button) => buttonsText.includes(button))) {
                console.log(buttonsText)
                await selectMode(password);
            } else if (fileOrText.message?.document) {
                const file = await fileOrText.getFile();

                await file.download('dump/encrypt.txt'); //TODO check if file has .txt extension

                const newFileBuffer = await encrypt(password);

                if (newFileBuffer) {
                    const file = new InputFile(newFileBuffer, 'encrypt.json');

                    const encryptedFile = await ctx.replyWithDocument(file, {
                        caption: CMSG.text.ecnrypted,
                    });

                    const removeAfterMinute = await ctx.reply(
                        CMSG.text.remove,
                        { reply_markup: { remove_keyboard: true } }
                    );

                    setTimeout(async () => {
                        // remove original file/text
                        ctx.chat?.id &&
                            (await ctx.api.deleteMessage(
                                ctx.chat?.id,
                                fileOrText.message.message_id
                            ));
                        // remove encrypted file
                        [encryptedFile, removeAfterMinute].forEach((message) =>
                            message.delete().catch((error) => {
                                LOGGER.error(
                                    '[cryptoConversations][selectMode][delete]',
                                    {
                                        metadata: error,
                                    }
                                );
                            })
                        );
                        await ctx.reply(CMSG.text.removed);
                    }, 60 * 1000);
                }
            } else if (fileOrText.message?.text) {
                const messageText = fileOrText.message.text;
                const newFileTxt = await writeToFile(
                    'encrypt.txt',
                    messageText
                );

                if (newFileTxt) {
                    const newFileBuffer = await encrypt(password);

                    if (newFileBuffer) {
                        const file = new InputFile(
                            newFileBuffer,
                            'encrypt.json'
                        );

                        const encryptedFile = await ctx.replyWithDocument(
                            file,
                            {
                                caption: CMSG.text.ecnrypted,
                            }
                        );

                        const removeAfterMinute = await ctx.reply(
                            CMSG.text.remove,
                            { reply_markup: { remove_keyboard: true } }
                        );

                        setTimeout(async () => {
                            // remove original file/text
                            ctx.chat?.id &&
                                (await ctx.api.deleteMessage(
                                    ctx.chat?.id,
                                    fileOrText.message.message_id
                                ));
                            // remove encrypted file
                            [encryptedFile, removeAfterMinute].forEach(
                                (message) =>
                                    message.delete().catch((error) => {
                                        LOGGER.error(
                                            '[cryptoConversations][selectMode][delete]',
                                            {
                                                metadata: error,
                                            }
                                        );
                                    })
                            );
                            await ctx.reply(CMSG.text.removed);
                        }, 60 * 1000);
                    }
                }
            } else {
                await ctx.reply(CMSG.text.error);
                await selectMode(password);
            }
        }
    }

    async function handleDecryption(
        ctx: BotContext,
        conversation: ConverstaionContext
    ) {
        const buttonsValues = Object.values(CMSG.buttons);
        await ctx.reply(CMSG.text.decrypt);

        const { message: passOrText } =
            await conversation.waitFor('message:text');
        const text = passOrText.text;

        if (buttonsValues.some((button) => text.includes(button))) {
            await selectMode(text);
        } else {
            await ctx.reply(CMSG.text.removePassword);
        }
    }

    return;
};
