import QRCode from 'qrcode';
import { LOGGER } from '../logger/index.js';

/**
 * Generates a QR code as a buffer from the given text.
 * @param text The text to be encoded in the QR code.
 * @returns A Promise that resolves to a Buffer containing the QR code image, or null if an error occurs.
 */
export const generateQR = async (text: string): Promise<Buffer | null> => {
    try {
        const qr = await QRCode.toBuffer(text);
        if (qr) {
            return qr;
        } else {
            return null;
        }
    } catch (err) {
        LOGGER.error('[generateQR]', { metadata: err });
        return null;
    }
};
