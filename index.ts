import { validateEnvs } from './validateEnvs';
import { runBot } from './src/bot';
import * as dotenv from 'dotenv';
import { LOGGER } from './src/logger';
import { connectDb } from './src/mongodb';
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
