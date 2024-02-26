import path from 'path';
import * as fs from 'fs';
import { LOGGER } from '../../logger/index.js';

const DATA_DIR = path.join(process.cwd(), 'dump');

export const writeToFile = async (
    filename: string,
    data: string
): Promise<boolean> => {
    try {
        await fs.promises.writeFile(path.join(DATA_DIR, filename), data);
        LOGGER.info('[writeToFile][success]', { metadata: filename });
        return true;
    } catch (error) {
        LOGGER.error('[writeToFile]', { metadata: error });
        return false;
    }
};

export const readFromFile = async (filename: string) => {
    return new Promise<string>((resolve, reject) => {
        fs.readFile(path.join(DATA_DIR, filename), 'utf8', (err, data) => {
            if (err) {
                LOGGER.error('[readFile]', { metadata: err });
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
};

export const returnFileLikeBuffer = async (filename: string): Promise<Buffer> => {
    return new Promise<Buffer>((resolve, reject) => {
        fs.readFile(path.join(DATA_DIR, filename), (err, data) => {
            if (err) {
                LOGGER.error('[readFile]', { metadata: err });
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
};

export const removeFileFromDir = async (filename: string): Promise<boolean> => {
    try {
        const filePath = path.join(DATA_DIR, filename);
        await fs.promises.unlink(filePath);
        LOGGER.info('[removeFileFromDir][success]', { metadata: filename });
        return true;
    } catch (error) {
        LOGGER.error('[removeFileFromDir]', { metadata: error });
        return false;
    }
};
