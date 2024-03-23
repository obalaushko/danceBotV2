import path from 'path';
import * as fs from 'fs';
import { LOGGER } from '../../logger/index.js';

/**
 * Manages file operations such as reading, writing, and removing files.
 */
class FileManager {
    private readonly DATA_DIR: string;

    constructor() {
        this.DATA_DIR = path.join(process.cwd(), 'dump');
    }

    /**
     * Checks if the folder exists.
     * @returns A promise that resolves to a boolean indicating whether the folder exists or not.
     */
    private async checkFolderExists(filename?: string): Promise<boolean> {
        try {
            await fs.promises.access(this.DATA_DIR);
            if (filename) {
                const filePath = path.join(this.DATA_DIR, filename);
                try {
                    await fs.promises.access(filePath);
                } catch (fileError) {
                    if (
                        (fileError as NodeJS.ErrnoException).code === 'ENOENT'
                    ) {
                        await fs.promises.writeFile(
                            filePath,
                            JSON.stringify([])
                        );
                    } else {
                        LOGGER.error('[checkFolderExists][fileAccess]', {
                            metadata: fileError,
                        });
                        return false;
                    }
                }
            }
            return true;
        } catch (error: any) {
            if (error.code === 'ENOENT') {
                try {
                    await fs.promises.mkdir(this.DATA_DIR, { recursive: true });
                    return true;
                } catch (mkdirError) {
                    LOGGER.error('[checkFolderExists][mkdir]', {
                        metadata: mkdirError,
                    });
                    return false;
                }
            } else {
                LOGGER.error('[checkFolderExists][access]', {
                    metadata: error,
                });
                return false;
            }
        }
    }

    /**
     * Writes data to a file.
     * @param filename - The name of the file to write to.
     * @param data - The data to write to the file.
     * @returns A promise that resolves to a boolean indicating whether the write operation was successful.
     */
    public async writeToFile(filename: string, data: string): Promise<boolean> {
        try {
            const exist = await this.checkFolderExists(filename);
            if (!exist) throw new Error('Folder does not exist');

            await fs.promises.writeFile(
                path.join(this.DATA_DIR, filename),
                data
            );
            LOGGER.info('[writeToFile][success]', { metadata: filename });
            return true;
        } catch (error) {
            LOGGER.error('[writeToFile]', { metadata: error });
            return false;
        }
    }

    /**
     * Reads data from a file.
     * @param filename - The name of the file to read.
     * @returns A promise that resolves with the contents of the file as a string.
     * @throws An error if the folder does not exist or if there is an error reading the file.
     */
    public async readFromFile(filename: string): Promise<string> {
        const exist = await this.checkFolderExists(filename);
        if (!exist) throw new Error('Folder does not exist');

        return new Promise<string>((resolve, reject) => {
            fs.readFile(
                path.join(this.DATA_DIR, filename),
                'utf8',
                (err, data) => {
                    if (err) {
                        LOGGER.error('[readFromFile]', { metadata: err });
                        reject(err);
                    } else {
                        resolve(data);
                    }
                }
            );
        });
    }

    /**
     * Reads a file from the specified filename and returns its content as a Buffer.
     * @param filename - The name of the file to read.
     * @returns A Promise that resolves to a Buffer containing the file content.
     * @throws An error if the folder does not exist or if there was an error reading the file.
     */
    public async returnFileLikeBuffer(filename: string): Promise<Buffer> {
        const exist = await this.checkFolderExists(filename);
        if (!exist) throw new Error('Folder does not exist');

        return new Promise<Buffer>((resolve, reject) => {
            fs.readFile(path.join(this.DATA_DIR, filename), (err, data) => {
                if (err) {
                    LOGGER.error('[returnFileLikeBuffer]', { metadata: err });
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }

    /**
     * Removes a file from the directory.
     * @param filename - The name of the file to be removed.
     * @returns A promise that resolves to a boolean indicating whether the file was successfully removed.
     */
    public async removeFileFromDir(filename: string): Promise<boolean> {
        try {
            const exist = await this.checkFolderExists(filename);
            if (!exist) throw new Error('Folder does not exist');

            const filePath = path.join(this.DATA_DIR, filename);
            await fs.promises.unlink(filePath);
            LOGGER.info('[removeFileFromDir][success]', { metadata: filename });
            return true;
        } catch (error) {
            LOGGER.error('[removeFileFromDir]', { metadata: error });
            return false;
        }
    }
}

export const fileManager = new FileManager();
