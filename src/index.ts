import * as dotenv from 'dotenv';

import { validateEnvs } from './validateEnvs.js';
import { runBot } from './bot/index.js';
import { connectDb } from './mongodb/connectDb.js';
import { LOGGER } from './logger/index.js';

dotenv.config();

const ENVS = process.env;
validateEnvs(ENVS);

const runApp = async () => {
    try {
        await connectDb()
            .then(() => {
                runBot();
            })
            .catch((error) => {
                LOGGER.error(`[runApp][Error on connect db]`, {
                    metadata: { error: error, stack: error.stack.toString() },
                });
            });
    } catch (error: any) {
        LOGGER.error(`[runApp][Error on run app]`, {
            metadata: { error: error, stack: error.stack.toString() },
        });
    }
};

runApp();
