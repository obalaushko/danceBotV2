import { createCipheriv, randomBytes, scryptSync } from 'crypto';
import path from 'path';
import * as fs from 'fs';
import { EncryptedData } from './crypto.type.js';
import { LOGGER } from '../../logger/index.js';
import { fileManager } from './file.manager.js';

const DATA_DIR = path.join(process.cwd(), 'dump');

if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
}

/**
 * Encrypts a password using AES-256-CBC encryption algorithm.
 *
 * @param password - The password to be encrypted.
 * @returns A Promise that resolves to a Buffer containing the encrypted data, or null if encryption fails.
 */
export const encrypt = async (password: string): Promise<Buffer | null> => {
    try {
        const algorithm = 'aes-256-cbc';
        const salt = randomBytes(16).toString('hex');
        const key = scryptSync(password, salt, 32);
        const iv = randomBytes(16);
        const cipher = createCipheriv(algorithm, key, iv);

        const data = await fileManager.readFromFile('encrypt.txt');
        let encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        const encryptedData: EncryptedData = {
            iv: iv.toString('hex'),
            encryptedText: encrypted,
            salt: salt,
        };

        const encryptFile = await fileManager.writeToFile(
            'encrypt.json',
            JSON.stringify(encryptedData)
        );
        if (encryptFile) {
            const file = await fileManager.returnFileLikeBuffer('encrypt.json');

            await fileManager.removeFileFromDir('encrypt.txt');
            await fileManager.removeFileFromDir('encrypt.json');

            return file;
        } else {
            return null;
        }
    } catch (error: any) {
        LOGGER.warn('[encrypt]', { metadata: error });
        return null;
    }
};
