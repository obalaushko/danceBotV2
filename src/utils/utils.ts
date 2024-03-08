import { Response } from 'express';
import moment from 'moment-timezone';

import { ROLES } from '../constants/global.js';
import { LOGGER } from '../logger/index.js';
import { getUserById } from '../mongodb/operations/users.js';
import { errorResponse } from '../server/response.js';

/**
 * Checks if a given message is a cancel command.
 * @param message - The message to check.
 * @returns True if the message is '/cancel', false otherwise.
 */
export const isCancel = (messsage: string) => {
    if (messsage === '/cancel') {
        return true;
    }
    return false;
};

/**
 * Checks if an object is empty.
 * @param obj - The object to check.
 * @returns True if the object is empty, false otherwise.
 */
export const isObjectEmpty = (obj: object) => {
    return Object.entries(obj).length === 0;
};

/**
 * Converts a Date object to a formatted string.
 * @param date - The Date object to be converted.
 * @returns The formatted date string in the format 'DD.MM.YYYY'.
 */
export const convertDate = (date: Date) => {
    return moment(date).format('DD.MM.YYYY');
};

/**
 * Checks if freezing is allowed based on the given date.
 * @param date - The date to check for freezing allowance.
 * @returns A string representation of the date after adding 90 days.
 * @throws An error if the date is empty.
 */
export const freezeIsAllowed = (date: Date | undefined): string => {
    if (!date) throw new Error('[freezeIsAllowed] Date is empty!');

    const dateAllowed = moment(date).add(90, 'days').toDate();

    return convertDate(dateAllowed);
};

/**
 * Returns the plural form of the word based on the given number.
 * @param number - The number to determine the plural form.
 * @returns The plural form of the word.
 */
export const pluralizeWord = (number: number) => {
    if (number === 1) {
        return 'заняття'; // Відмінюємо для числа 1
    } else if (number >= 2 && number <= 4) {
        return 'заняття'; // Відмінюємо для чисел 2-4
    } else {
        return 'занять'; // Відмінюємо для інших чисел
    }
};

/**
 * Capitalizes the first letter of a given string.
 * 
 * @param text - The string to capitalize.
 * @returns The input string with the first letter capitalized.
 */
export const capitalizeFirstLetter = (text: string): string => {
    return text.charAt(0).toUpperCase() + text.slice(1);
};

/**
 * Checks if the last freeze date is older than 90 days.
 * @param dateFreeze - The last freeze date.
 * @returns A boolean indicating whether the last freeze date is older than 90 days.
 */
export const checkLastFreeze = (dateFreeze: Date | undefined): boolean => {
    if (!dateFreeze) return true;
    const today = moment.utc();

    const diff = moment.utc(dateFreeze).diff(today, 'days');
    if (diff >= 90) {
        return true;
    } else {
        return false;
    }
};

/**
 * Checks if a user has admin or developer role.
 * @param userId - The ID of the user to check.
 * @returns A Promise that resolves to a boolean indicating whether the user has admin or developer role.
 */
export const hasAdminOrDev = async (userId: number): Promise<boolean> => {
    try {
        const user = await getUserById(userId);
        if (user) {
            const { role } = user;
            return role === ROLES.Admin || role === ROLES.Developer;
        } else {
            return false;
        }
    } catch (error) {
        LOGGER.error('[checkUserAdminRole]', { metadata: error });
        return false;
    }
};

/**
 * Checks if the user has access or not.
 * @param res - The response object.
 * @param userId - The ID of the user.
 * @returns A Promise that resolves to void.
 */
export const isAccessDenied = async (userId: number) => {
    const isAdminOrDeveloper = await hasAdminOrDev(userId);


    return isAdminOrDeveloper;
}
