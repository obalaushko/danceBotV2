import {
    createCipheriv,
    createDecipheriv,
    randomBytes,
    scryptSync,
} from 'crypto';

const algorithm = 'aes-256-cbc';
const key = scryptSync('cryptoQR', 'salt', 32);
const iv = randomBytes(16);

/**
 * Encrypts the given text using a cipher algorithm.
 * @param text The text to be encrypted.
 * @returns A promise that resolves to the encrypted text.
 */
export const encryptQR = async (text: string): Promise<string> => {
    const cipher = createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
};

/**
 * Decrypts an encrypted string using the specified algorithm, key, and initialization vector (IV).
 * @param encrypted The encrypted string to decrypt.
 * @returns A Promise that resolves to the decrypted string.
 */
export const decryptQR = async (encrypted: string): Promise<string> => {
    const decipher = createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
};
