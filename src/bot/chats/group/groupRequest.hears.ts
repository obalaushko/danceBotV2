import { ROLES } from '../../../constants/global.js';
import { MSG } from '../../../constants/messages.js';
import { LOGGER } from '../../../logger/index.js';
import { updateUsersToInactive } from '../../../mongodb/operations/index.js';
import { getUserById } from '../../../mongodb/operations/users.js';
import { groupChat } from '../../bot.js';
import { userMenu } from '../../menu/index.js';

/**
 * Handles group chat join requests and left chat member events.
 */
export const groupRequestHears = () => {
    // !Bot must be admin in group
    groupChat.on('chat_join_request', async (ctx) => {
        try {
            const {
                user_chat_id,
                from,
                invite_link,
                chat: { id },
            } = ctx.chatJoinRequest;

            const inviteLink = invite_link?.invite_link;

            const user = await getUserById(user_chat_id);

            const revokeLink = async () => {
                try {
                    inviteLink &&
                        (await ctx.api.revokeChatInviteLink(id, inviteLink));
                    if (user?.inviteLink) {
                        user.inviteLink = null;
                        await user.save();
                    }
                } catch (err) {
                    LOGGER.error('[revokeChatInviteLink]', { metadata: err });
                }
            };

            if (user?.approved && user.inviteLink === inviteLink) {
                const approved = await ctx.approveChatJoinRequest(user_chat_id);
                LOGGER.info('[approveChatJoinRequest] Approve user', {
                    metadata: user,
                });

                if (approved) {
                    LOGGER.info('[userDialogue]', { metadata: user });
                    await ctx.api.sendMessage(
                        user.userId,
                        MSG.welcome.user(user),
                        {
                            reply_markup: userMenu,
                        }
                    );

                    // Revoke
                    revokeLink();
                } else {
                    LOGGER.error(
                        '[approveChatJoinRequest] Something wrong with approve user',
                        {
                            metadata: ctx.chatJoinRequest,
                        }
                    );
                }
            } else {
                await ctx.declineChatJoinRequest(user_chat_id);
                LOGGER.error('[declineChatJoinRequest] Decline user', {
                    metadata: from,
                });

                // Revoke
                revokeLink();
            }
        } catch (err) {
            LOGGER.error('[chat_join_request]', { metadata: err });
        }
    });

    groupChat.on(':left_chat_member', async (ctx) => {
        const user = ctx.message.left_chat_member;
        if (user.is_bot) return;

        LOGGER.info('[left_chat_member]', { metadata: user });

        try {
            const checkUser = await getUserById(user.id);
            if (checkUser && checkUser.role === ROLES.Inactive) return;

            const deactivatedUser = await updateUsersToInactive(user.id);

            if (deactivatedUser?.length) {
                LOGGER.info('[Inactive]', {
                    metadata: deactivatedUser,
                });
            } else {
                LOGGER.error('[Inactive]', {
                    metadata: deactivatedUser,
                });
            }
        } catch (error) {
            LOGGER.error('[Inactive]', { metadata: error });
        }
    });

    groupChat.on(':new_chat_members:me', async (ctx) => {
        try {
            const chatInfo = await ctx.getChat();
            LOGGER.info('Connect in new group,', { metadata: chatInfo });
        } catch (err) {
            LOGGER.error('Error in message:new_chat_members:me', {
                metadata: err,
            });
        }
    });

    // groupChat.on(':new_chat_members:me', async (ctx) => {
    //     try {
    //         const chatInfo = await ctx.getChat();

    //         if (chatInfo.id !== ENV_VARIABLES.GROUP_ID) {
    //             await ctx.api.leaveChat(chatInfo.id);
    //         }
    //     } catch (err) {
    //         LOGGER.error('Error in message:new_chat_members:me', {
    //             metadata: err,
    //         });
    //     }
    // });
};
