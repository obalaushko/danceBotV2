import cron from 'node-cron';
import {
    checkAndDeactivateSubscriptions,
    checkAndDefrostSubscriptions,
    checkLastDayOfUsage,
} from './subscriptions.js';
import { deleteOldLogs } from '../mongodb/operations/changeLog.js';
import { checkAndUpdateTelegramUser } from './users.js';

/**
 * Schedules and runs various tasks using cron jobs.
 */
export const tasksCron = async () => {
    cron.schedule(
        '0 12 * * *',
        async function () {
            await checkAndDeactivateSubscriptions();
            await checkAndDefrostSubscriptions();
            await checkLastDayOfUsage();
        },
        {
            scheduled: true,
            timezone: 'Europe/Kiev',
        }
    );

    cron.schedule(
        '0 0 * * *',
        async function () {
            await deleteOldLogs();
        },
        {
            scheduled: true,
            timezone: 'Europe/Kiev',
        }
    );

    cron.schedule(
        '0 12 * * 6',
        async function () {
            await checkAndUpdateTelegramUser();
        },
        {
            scheduled: true,
            timezone: 'Europe/Kiev',
        }
    );
};
