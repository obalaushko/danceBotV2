import { run } from '@grammyjs/runner';
import { bot } from './bot';

const runBot = () => {
    if (!bot.isInited()) {
        console.log('BOT NOT INITIATED');
        run(bot, {
            runner: {
                fetch: {
                    allowed_updates: [
                        'callback_query',
                        'channel_post',
                        'chat_join_request',
                        'chat_member',
                        'chosen_inline_result',
                        'edited_channel_post',
                        'edited_message',
                        'inline_query',
                        'message',
                        'my_chat_member',
                        'poll',
                        'poll_answer',
                        'pre_checkout_query',
                        'shipping_query',
                    ],
                },
            },
        });
    }
};

export { runBot };
