import { ENV_VARIABLES } from './../constants/global';
import express from 'express';
import cors from 'cors';
import { LOGGER } from '../logger/index.js';
import router from './routes/route.js';
import moment from 'moment-timezone';

export const serverInit = async () => {
    moment.tz.setDefault('Europe/Kiev');

    const app = express();

    app.use(express.json());
    app.use(cors());

    app.get('/', (req, res) => res.json({ message: 'Server is running' }));

    app.use('/api', router);

    app.listen(ENV_VARIABLES.PORT, () => {
        LOGGER.info(`Server started on port ${ENV_VARIABLES.PORT}...`);
    });
};
