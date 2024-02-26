import { createCipheriv, randomBytes, scryptSync } from 'crypto';
import path from 'path';
import * as fs from 'fs';
import { EncryptedData } from './crypto.type.js';
import { LOGGER } from '../../logger/index.js';
import {
    readFromFile,
    removeFileFromDir,
    returnFileLikeBuffer,
    writeToFile,
} from './file.manager.js';

const DATA_DIR = path.join(process.cwd(), 'dump');

if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
}

export const encrypt = async (password: string): Promise<Buffer | null> => {
    try {
        const algorithm = 'aes-256-cbc';
        const salt = randomBytes(16).toString('hex');
        const key = scryptSync(password, salt, 32);
        const iv = randomBytes(16);
        const cipher = createCipheriv(algorithm, key, iv);

        const data = await readFromFile('encrypt.txt');
        let encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        const encryptedData: EncryptedData = {
            iv: iv.toString('hex'),
            encryptedText: encrypted,
            salt: salt,
        };

        const encryptFile = await writeToFile(
            'encrypt.json',
            JSON.stringify(encryptedData)
        );
        if (encryptFile) {
            const file = await returnFileLikeBuffer('encrypt.json');

            await removeFileFromDir('encrypt.txt');
            await removeFileFromDir('encrypt.json');
            
            return file;
        } else {
            return null;
        }
    } catch (error: any) {
        LOGGER.error('[encrypt]', { metadata: error });
        return null;
    }
};
