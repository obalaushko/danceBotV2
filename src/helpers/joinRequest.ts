import { userMenu } from "../bot/menu";
import { MSG } from "../constants";
import { LOGGER } from "../logger";
import { getUserById } from "../mongodb/operations";

export const handleChatJoinRequest = async (ctx: any) => {
    try {
        const { user_chat_id, from } = ctx.chatJoinRequest;

        const user = await getUserById(user_chat_id);

        if (user?.approved) {
            const approved = await ctx.approveChatJoinRequest(user_chat_id);
            LOGGER.info('[approveChatJoinRequest] Approve user', {
                metadata: user,
            });

            if (approved) {
                LOGGER.info('[userDialogue]', { metadata: user });
                await ctx.api.sendMessage(user.userId, MSG.welcome.user(user), {
                    reply_markup: userMenu,
                });
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
        }
    } catch (err) {
        LOGGER.error('[chat_join_request]', { metadata: err });
    }
};