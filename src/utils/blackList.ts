import { LOGGER } from '../logger/index.js';
import { fileManager } from '../crypto/core/file.manager.js';
import { ENV_VARIABLES } from '../constants/global.js';

/**
 * Adds a user ID to the blacklist.
 * @param userId - The ID of the user to add to the blacklist.
 * @returns A Promise that resolves to an array of blacklisted user IDs, or undefined if there was an error.
 */
export const addToBlacklist = async (
    userId: number
): Promise<number[] | undefined> => {
    let blackList = [];

    if (userId === ENV_VARIABLES.ADMIN_ID) return;

    try {
        const data = await fileManager.readFromFile('blackList.json');
        blackList = JSON.parse(data);
    } catch (err) {
        LOGGER.error(`Error reading file from disk: `, { metadata: err });
    }

    if (blackList.includes(userId)) {
        // User is already in the blacklist, ignore
        return;
    }

    blackList.push(userId);

    try {
        await fileManager.writeToFile(
            'blackList.json',
            JSON.stringify(blackList, null, 4)
        );
        LOGGER.info(`User ${userId} added to the blacklist.`);

        return blackList;
    } catch (err) {
        LOGGER.error(`[addToBlacklist] Error writing file: `, {
            metadata: err,
        });
    }
};

/**
 * Loads the blacklist from the 'blackList.json' file.
 * @returns A promise that resolves to an array of numbers representing the blacklist.
 */
export const loadBlacklist = async (): Promise<number[]> => {
    let blackList = [];
    try {
        const data = await fileManager.readFromFile('blackList.json');
        blackList = JSON.parse(data);
    } catch (err) {
        LOGGER.error(`[loadBlacklist] Error reading file from disk: `, {
            metadata: err,
        });
    }

    return blackList;
};

/**
 * Clears the blacklist by writing an empty array to the 'blackList.json' file.
 * @returns A Promise that resolves when the blacklist is cleared.
 */
export const clearBlacklist = async (): Promise<void> => {
    try {
        await fileManager.writeToFile(
            'blackList.json',
            JSON.stringify([], null, 4)
        );
    } catch (err) {
        LOGGER.error(`[clearBlacklist] Error writing file: `, {
            metadata: err,
        });
    }
};

/**
 * Removes a user from the blacklist.
 * @param userId - The ID of the user to be removed from the blacklist.
 * @returns A Promise that resolves to an array of numbers representing the updated blacklist, or undefined if the user was not in the blacklist.
 */
export const removeFromBlacklist = async (
    userId: number
): Promise<number[] | undefined> => {
    let blackList = [];
    try {
        const data = await fileManager.readFromFile('blackList.json');
        blackList = JSON.parse(data);
    } catch (err) {
        LOGGER.error(`Error reading file from disk: `, { metadata: err });
    }

    if (!blackList.includes(userId)) {
        // User is not in the blacklist, ignore
        return;
    }

    blackList = blackList.filter((id: number) => id !== userId);

    try {
        await fileManager.writeToFile(
            'blackList.json',
            JSON.stringify(blackList, null, 4)
        );
        LOGGER.info(`User ${userId} removed from the blacklist.`);

        return blackList;
    } catch (err) {
        LOGGER.error(`[removeFromBlacklist] Error writing file: `, {
            metadata: err,
        });
    }
};
