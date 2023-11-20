import { MSG } from "../../../constants/messages.js";
import { LOGGER } from "../../../logger/index.js";
import { getUserById } from "../../../mongodb/operations/users.js";
import { groupChat } from "../../bot.js";
import { userMenu } from "../../menu/index.js";

export const joinRequestHears = () => {
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
                    await ctx.api.sendMessage(user.userId, MSG.welcome.user(user), {
                        reply_markup: userMenu,
                    });
    
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
}