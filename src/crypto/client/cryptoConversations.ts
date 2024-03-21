import { InputFile, Keyboard } from 'grammy';
import { BotContext, ConverstaionContext } from '../../bot/types/index.js';
import { LOGGER } from '../../logger/index.js';
import { CMSG } from './constants/index.js';
import { encrypt } from '../core/encrypt.js';
import { fileManager } from '../core/file.manager.js';
import { decrypt } from '../core/decrypt.js';

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
     * Leaves the conversation if the provided message matches the cancel command or button.
     * @param message - The message to check for cancellation.
     * @returns A boolean indicating whether the conversation was left or not.
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
                return true;
            }
        } catch (error) {
            LOGGER.error('[cryptoConversations][leaveConversation]', {
                metadata: error,
            });
        }
        return false;
    };

    /**
     * Capitalizes the first letter of a word.
     * @param word - The word to capitalize.
     * @returns The word with the first letter capitalized.
     */
    function capitalizeFirstLetter(word: string): string {
        return word.charAt(0).toUpperCase() + word.slice(1);
    }

    /**
     * Selects the mode of operation based on the original message.
     * If the original message is "encrypt", it calls handleCryptoOperation with the 'encrypt' mode.
     * If the original message is "decrypt", it calls handleCryptoOperation with the 'decrypt' mode.
     * @param originalMessage The original message received.
     */
    const selectMode = async (originalMessage: string) => {
        if (await leaveConversation(originalMessage)) {
            return;
        }

        if (originalMessage === CMSG.buttons.encrypt) {
            await handleCryptoOperation(ctx, conversation, 'encrypt');
        } else if (originalMessage === CMSG.buttons.decrypt) {
            await handleCryptoOperation(ctx, conversation, 'decrypt');
        }
    };

    /**
     * Handles the crypto operation (encrypt or decrypt) based on the given parameters.
     *
     * @param ctx - The BotContext object.
     * @param conversation - The ConverstaionContext object.
     * @param operation - The operation to perform, either 'encrypt' or 'decrypt'.
     */
    const handleCryptoOperation = async (
        ctx: BotContext,
        conversation: ConverstaionContext,
        operation: 'encrypt' | 'decrypt'
    ) => {
        const isEncrypting: boolean = operation === 'encrypt';
        const buttonsValues = Object.values(CMSG.buttons);
        const actionText = isEncrypting ? CMSG.text.encrypt : CMSG.text.decrypt;

        await ctx.reply(actionText);

        const { message: passOrText } =
            await conversation.waitFor('message:text');
        const password: string = passOrText.text;

        if (buttonsValues.some((button) => password.includes(button))) {
            await selectMode(password);
        } else {
            try {
                ctx.chat?.id &&
                    (await ctx.api.deleteMessage(
                        ctx.chat?.id,
                        passOrText.message_id
                    ));
            } catch (error) {
                LOGGER.error(
                    `[cryptoConversations][handle${operation}][delete]`,
                    { metadata: error }
                );
            }

            const waitFileOrText = async (repeat = false) => {
                const promptText = repeat
                    ? CMSG.text[
                          `repeatNextStepAfterPass${capitalizeFirstLetter(
                              operation
                          )}` as keyof typeof CMSG.text
                      ]
                    : CMSG.text[
                          `nextStepAfterPass${capitalizeFirstLetter(
                              operation
                          )}` as keyof typeof CMSG.text
                      ];

                await ctx.reply(promptText);

                const fileOrText = await conversation.waitFor([
                    ':document',
                    'message:text',
                ]);

                const buttonsText = fileOrText.message?.text || '';

                if (
                    buttonsValues.some((button) => buttonsText.includes(button))
                ) {
                    await selectMode(buttonsText);
                } else if (fileOrText.message?.document) {
                    await handleDocument(
                        isEncrypting,
                        ctx,
                        conversation,
                        fileOrText,
                        waitFileOrText,
                        password
                    );
                } else if (fileOrText.message?.text) {
                    await handleTextMessage(
                        isEncrypting,
                        ctx,
                        fileOrText,
                        password,
                        waitFileOrText
                    );
                } else {
                    await ctx.reply(CMSG.text.error);
                    await selectMode(
                        isEncrypting
                            ? CMSG.buttons.encrypt
                            : CMSG.buttons.decrypt
                    );
                }
            };

            await waitFileOrText();
        }
    };

    /**
     * Handles the document based on the specified parameters.
     * @param isEncrypting - Indicates whether the document is being encrypted or decrypted.
     * @param ctx - The BotContext object.
     * @param conversation - The ConverstaionContext object.
     * @param fileOrText - The file or text to be processed.
     * @param waitFileOrText - The function to wait for the file or text.
     * @param password - The password used for encryption or decryption.
     */
    const handleDocument = async (
        isEncrypting: boolean,
        ctx: BotContext,
        conversation: ConverstaionContext,
        fileOrText: any,
        waitFileOrText: (arg: boolean) => void,
        password: string
    ) => {
        const fileType = fileOrText.message?.document?.mime_type;

        const isWrongEncryptingType = isEncrypting && fileType !== 'text/plain';
        const isWrongDecryptingType =
            !isEncrypting &&
            fileType !== 'application/json' &&
            fileType !== 'application/binary';

        if (isWrongEncryptingType || isWrongDecryptingType) {
            await ctx.reply(CMSG.text.wrongType);
            await waitFileOrText(true);
            return;
        }

        const fileName = isEncrypting ? 'encrypt.txt' : 'decrypt.json';

        const file = await fileOrText.getFile();

        await conversation.external(async () => {
            await file.download(`dump/${fileName}`);
        });

        const newFileBuffer = await conversation.external(
            async () =>
                await (isEncrypting ? encrypt(password) : decrypt(password))
        );

        if (newFileBuffer) {
            const fileExtension = isEncrypting ? 'encrypt.json' : 'decrypt.txt';
            const file = new InputFile(newFileBuffer, fileExtension);

            const actionText = isEncrypting
                ? CMSG.text.ecnrypted
                : CMSG.text.decrypted;
            const encryptedFile = await ctx.replyWithDocument(file, {
                caption: actionText,
            });

            const removeAfterMinute = await ctx.reply(CMSG.text.remove, {
                reply_markup: { remove_keyboard: true },
            });

            setTimeout(async () => {
                try {
                    ctx.chat?.id &&
                        (await ctx.api.deleteMessage(
                            ctx.chat?.id,
                            fileOrText.message.message_id
                        ));
                    [encryptedFile, removeAfterMinute].forEach((message) =>
                        message.delete().catch((error: any) => {
                            LOGGER.error(
                                `[cryptoConversations][selectMode][delete]`,
                                { metadata: error }
                            );
                        })
                    );
                } catch (error) {
                    LOGGER.error(`[cryptoConversations][selectMode][delete]`, {
                        metadata: error,
                    });
                }
                await ctx.reply(CMSG.text.removed);
            }, 60 * 1000);
        } else {
            await ctx.reply(CMSG.text.wrongPassword);
            await waitFileOrText(true);
        }
    };

    /**
     * Handles a text message by encrypting or decrypting the message content and sending the result as a document.
     * @param isEncrypting - A boolean indicating whether the message should be encrypted or decrypted.
     * @param ctx - The BotContext object.
     * @param fileOrText - The file or text message to be processed.
     * @param password - The password used for encryption or decryption.
     */
    const handleTextMessage = async (
        isEncrypting: boolean,
        ctx: BotContext,
        fileOrText: any,
        password: string,
        waitFileOrText: (arg: boolean) => void,
    ) => {
        const messageText = fileOrText.message.text;
        const fileName = isEncrypting ? 'encrypt.txt' : 'decrypt.txt';

        const newFileTxt = await fileManager.writeToFile(fileName, messageText);

        if (newFileTxt) {
            const newFileBuffer = await (isEncrypting
                ? encrypt(password)
                : decrypt(password));

            if (newFileBuffer) {
                const fileExtension = isEncrypting
                    ? 'encrypt.json'
                    : 'decrypt.txt';
                const file = new InputFile(newFileBuffer, fileExtension);

                const actionText = isEncrypting
                    ? CMSG.text.ecnrypted
                    : CMSG.text.decrypted;
                const encryptedFile = await ctx.replyWithDocument(file, {
                    caption: actionText,
                });

                const removeAfterMinute = await ctx.reply(CMSG.text.remove, {
                    reply_markup: { remove_keyboard: true },
                });

                setTimeout(async () => {
                    try {
                        ctx.chat?.id &&
                            (await ctx.api.deleteMessage(
                                ctx.chat?.id,
                                fileOrText.message.message_id
                            ));
                        [encryptedFile, removeAfterMinute].forEach((message) =>
                            message.delete().catch((error: any) => {
                                LOGGER.error(
                                    `[cryptoConversations][selectMode][delete]`,
                                    { metadata: error }
                                );
                            })
                        );
                    } catch (error) {
                        LOGGER.error(
                            `[cryptoConversations][selectMode][delete]`,
                            { metadata: error }
                        );
                    }
                    await ctx.reply(CMSG.text.removed);
                }, 60 * 1000);
            } else {
                await ctx.reply(CMSG.text.wrongPassword);
                await waitFileOrText(true);
            }
        }
    };

    await ctx.reply(CMSG.text.start, { reply_markup: keyboard });
    const { message } = await conversation.waitFor('message:text');

    const messageText = message?.text;
    await selectMode(messageText);
};
