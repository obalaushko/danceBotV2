import mongoose from 'mongoose';
import { LOGGER } from '../logger/index.js';
import { ENV_VARIABLES } from '../constants/global.js';

const DB = ENV_VARIABLES.DB;
const USER = ENV_VARIABLES.DB_USER;
const PASSWORD = ENV_VARIABLES.DB_PASSWORD;
const DB_NAME = ENV_VARIABLES.DB_NAME;
const HOST = ENV_VARIABLES.DB_HOST;

const dbUrl = `${DB}${USER}:${PASSWORD}@${HOST}/${DB_NAME}`;

const connectDb = async () => {
    try {
        mongoose.set('strictQuery', false);
        const mongoDbConnection = await mongoose.connect(dbUrl, {
            retryReads: true,
            retryWrites: true,
        });
        if (mongoDbConnection.connection.readyState === 1) {
            LOGGER.info(`[connectDb][DB connected succesfully]`, {
                metadata: '',
                sendLog: true,
            });
        } else {
            LOGGER.error(`[connectDb][DB connection failed]`, { metadata: '' });
        }
    } catch (error: any) {
        // setTimeout(connectDb, 5000);
        LOGGER.error(`[connectDb][DB connection failed]`, {
            metadata: { error: error, stack: error.stack.toString() },
        });
    }
};

export { connectDb };
