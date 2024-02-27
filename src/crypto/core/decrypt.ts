import { createDecipheriv, scryptSync } from 'crypto';
import path from 'path';
import * as fs from 'fs';
import { LOGGER } from '../../logger/index.js';

import { fileManager } from './file.manager.js';

const DATA_DIR = path.join(process.cwd(), 'dump');

if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
}

/**
 * Checks the correctness of a JSON data.
 *
 * @param data - The JSON data to be checked.
 * @returns The parsed JSON data if it is correct, otherwise undefined.
 */
const checkJsonCorrectness = async (data: any) => {
    try {
        const json = JSON.parse(data);
        if (json) return json;
    } catch (error) {
        LOGGER.error('An error occurred while checking the JSON file:', {
            metadata: error,
        });
    }
};

/**
 * Decrypts a file using a password.
 * @param password - The password used for decryption.
 * @returns A Promise that resolves to the decrypted file as a Buffer, or null if an error occurred.
 */
export const decrypt = async (password: string) => {
    try {
        const data = await fileManager.readFromFile('decrypt.json');
        const encryptedData = await checkJsonCorrectness(data);

        if (!encryptedData.iv || !encryptedData.encryptedText) {
            LOGGER.error('The file does not match the expected format.');
            return;
        }

        const algorithm = 'aes-256-cbc';
        const key = scryptSync(password, encryptedData.salt || 'salt', 32);
        const iv = Buffer.from(encryptedData.iv, 'hex');
        const decipher = createDecipheriv(algorithm, key, iv);
        let decrypted = decipher.update(
            encryptedData.encryptedText,
            'hex',
            'utf-8'
        );
        decrypted += decipher.final('utf-8');

        const decryptFile = await fileManager.writeToFile(
            'decrypt.txt',
            decrypted
        );
        if (decryptFile) {
            const file = await fileManager.returnFileLikeBuffer('decrypt.txt');

            await fileManager.removeFileFromDir('decrypt.json');
            await fileManager.removeFileFromDir('decrypt.txt');

            return file;
        }
    } catch (error: any) {
        LOGGER.error('An error occurred during decryption:', {
            metadata: error.message,
        });
        return null;
    }
};
