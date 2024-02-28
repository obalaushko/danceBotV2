import express from 'express';
import cors from 'cors';
import { bot } from '../bot/bot.js';
export const serverInit = async () => {
    const app = express();

    app.use(express.json());
    app.use(cors());

    app.post('/web-data', async (req, res) => {
        const { quaryId, user } = req.body;
        try {
            await bot.api.answerWebAppQuery(quaryId, {
                type: 'article',
                id: quaryId,
                title: 'Test message',
                input_message_content: {
                    message_text: 'Test message ' + user.username,
                },
            });
            return res.status(200).send('ok');
        } catch (error: any) {
            console.log(error);
            return res.status(500).json({ error: error });
        }
    });

    const PORT = 8000;

    app.listen(PORT, () => {
        console.log(`Server started on port ${PORT}...`);
    });
};
