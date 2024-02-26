import path from 'path';
import * as fs from 'fs';
import { LOGGER } from '../../logger/index.js';

const DATA_DIR = path.join(process.cwd(), 'dump');

/**
 * Checks if a folder exists at the specified path.
 * If the folder does not exist, it creates it.
 *
 * @returns A promise that resolves to a boolean indicating whether the folder exists or was successfully created.
 */
const checkFolderExists = async (): Promise<boolean> => {
    try {
        await fs.promises.access(DATA_DIR);
        return true;
    } catch (error: any) {
        if (error.code === 'ENOENT') {
            try {
                await fs.promises.mkdir(DATA_DIR, { recursive: true });
                return true;
            } catch (mkdirError) {
                LOGGER.error('[checkFolderExists][mkdir]', {
                    metadata: mkdirError,
                });
                return false;
            }
        } else {
            LOGGER.error('[checkFolderExists][access]', { metadata: error });
            return false;
        }
    }
};

/**
 * Writes data to a file.
 * @param filename - The name of the file to write to.
 * @param data - The data to write to the file.
 * @returns A promise that resolves to a boolean indicating whether the write operation was successful.
 */
export const writeToFile = async (
    filename: string,
    data: string
): Promise<boolean> => {
    try {
        const exist = await checkFolderExists();
        if (!exist) throw new Error('Folder does not exist');

        await fs.promises.writeFile(path.join(DATA_DIR, filename), data);
        LOGGER.info('[writeToFile][success]', { metadata: filename });
        return true;
    } catch (error) {
        LOGGER.error('[writeToFile]', { metadata: error });
        return false;
    }
};

/**
 * Reads data from a file asynchronously.
 * @param filename - The name of the file to read.
 * @returns A promise that resolves with the data read from the file.
 */
export const readFromFile = async (filename: string) => {
    const exist = await checkFolderExists();
    if (!exist) throw new Error('Folder does not exist');

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

/**
 * Reads a file from the specified path and returns its content as a Buffer.
 * @param filename - The name of the file to read.
 * @returns A Promise that resolves with the file content as a Buffer.
 */
export const returnFileLikeBuffer = async (
    filename: string
): Promise<Buffer> => {
    const exist = await checkFolderExists();
    if (!exist) throw new Error('Folder does not exist');
    
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

/**
 * Removes a file from the specified directory.
 * @param filename - The name of the file to be removed.
 * @returns A promise that resolves to a boolean indicating whether the file was successfully removed.
 */
export const removeFileFromDir = async (filename: string): Promise<boolean> => {
    try {
        const exist = await checkFolderExists();
        if (!exist) throw new Error('Folder does not exist');

        const filePath = path.join(DATA_DIR, filename);
        await fs.promises.unlink(filePath);
        LOGGER.info('[removeFileFromDir][success]', { metadata: filename });
        return true;
    } catch (error) {
        LOGGER.error('[removeFileFromDir]', { metadata: error });
        return false;
    }
};
