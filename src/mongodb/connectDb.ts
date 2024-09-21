import mongoose from 'mongoose';
import { LOGGER } from '../logger/index.js';
import { ENV_VARIABLES } from '../constants/global.js';

const DB = ENV_VARIABLES.DB;
const USER = ENV_VARIABLES.DB_USER;
const PASSWORD = ENV_VARIABLES.DB_PASSWORD;
const DB_NAME = ENV_VARIABLES.DB_NAME;
const HOST = ENV_VARIABLES.DB_HOST;

const dbUrl = `${DB}${USER}:${PASSWORD}@${HOST}/${DB_NAME}`;

let dbConnected = false; // Database connection status
const MAX_RETRIES = 5; // Maximum number of connection attempts
const RETRY_INTERVAL = 5000; // Interval between attempts (in ms)

const connectDb = async (retryCount = 0) => {
    try {
        mongoose.set('strictQuery', false);

        const mongoDbConnection = await mongoose.connect(dbUrl, {
            retryReads: true,
            retryWrites: true,
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
        });

        if (mongoDbConnection.connection.readyState === 1) {
            dbConnected = true;
            LOGGER.info(`[connectDb][DB connected successfully]`, {
                metadata: '',
                sendLog: true,
            });
            return true;
        } else {
            dbConnected = false;
            LOGGER.error(`[connectDb][DB connection failed]`, { metadata: '' });
            return false;
        }
    } catch (error: any) {
        dbConnected = false;
        LOGGER.error(
            `[connectDb][DB connection failed on attempt ${retryCount + 1}]`,
            {
                metadata: {
                    error: error.message,
                    stack: error.stack.toString(),
                },
            }
        );

        if (retryCount < MAX_RETRIES) {
            LOGGER.info(
                `[connectDb][Retrying in ${RETRY_INTERVAL / 1000} seconds...]`,
                { metadata: '' }
            );

            setTimeout(() => connectDb(retryCount + 1), RETRY_INTERVAL);
        } else {
            LOGGER.error(
                `[connectDb][Max retries reached, connection failed]`,
                {
                    metadata: {
                        error: error.message,
                        stack: error.stack.toString(),
                    },
                }
            );
        }

        return false;
    }
};

const isDbConnected = () => dbConnected;

export { connectDb, isDbConnected };
