import { getAllActiveUserUsers } from './../mongodb/operations/users';
import express from 'express';
import cors from 'cors';
import { LOGGER } from '../logger/index.js';
import { markLessonAsUsed } from '../mongodb/operations/subscriptions.js';
export const serverInit = async () => {
    const app = express();

    app.use(express.json());
    app.use(cors());

    app.get('/', (req, res) => res.json({ message: 'Server is running' }));

    app.post('/web-data', async (req, res) => {
        const { quaryId, userIds } = req.body;
        try {
            if (userIds) {
                const users = await getAllActiveUserUsers();

                if (users) {
                    const matchingUsers = users.filter((user) =>
                        userIds.includes(user.userId)
                    );

                    if (matchingUsers.length > 0) {
                        const updateSubscriptions = await markLessonAsUsed(
                            matchingUsers.map((user) => user.userId)
                        );

                        if (updateSubscriptions?.length) {
                            LOGGER.info('[markUser]', {
                                metadata: updateSubscriptions,
                            });

                            if (!users) throw new Error('Users not found!');

                            // const updatedUsers = users.filter((user) =>
                            //     updateSubscriptions.some(
                            //         (updateUser) => updateUser.userId === user.userId
                            //     )
                            // );

                            // await bot.api.answerWebAppQuery(quaryId, {
                            //     type: 'article',
                            //     id: quaryId,
                            //     title: 'Updated users!',
                            //     input_message_content: {
                            //         parse_mode: 'HTML',
                            //         message_text: MSG.chooseUserToMark(updatedUsers),
                            //     },
                            // });

                            return res.status(200).send('ok');
                        }
                    } else {
                        return res.status(400).send('User not found');
                    }
                }
            } else {
                return res.status(400).send('Bad request');
            }
        } catch (error: any) {
            LOGGER.error('[web-data]', { metadata: error });
            return res.status(500).json({ error: error });
        }
    });

    app.post('/logs', async (req, res) => {
        try {
            const { log } = req.body;

            LOGGER.info('LOGS', log);
            return res.status(200).send('ok');
        } catch (error: any) {
            LOGGER.info('LOGS', { metadata: error });
            return res.status(500).json({ error: error });
        }
    });

    const PORT = 2604;

    app.listen(PORT, () => {
        LOGGER.info(`Server started on port ${PORT}...`);
    });
};
