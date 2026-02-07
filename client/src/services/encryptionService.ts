/**
 * Encryption Service
 * Provides AES-256 encryption/decryption for sensitive sacrament data
 */

import * as CryptoJS from 'crypto-js';
import config from '../config';

export class EncryptionService {
    private static instance: EncryptionService;
    private encryptionKey: string;

    private constructor() {
        this.encryptionKey = config.security.encryptionKey;
    }

    public static getInstance(): EncryptionService {
        if (!EncryptionService.instance) {
            EncryptionService.instance = new EncryptionService();
        }
        return EncryptionService.instance;
    }

    /**
     * Encrypt a string value using AES-256
     */
    public encrypt(plaintext: string): string {
        if (!config.security.encryptionEnabled) {
            return plaintext;
        }

        try {
            const encrypted = CryptoJS.AES.encrypt(plaintext, this.encryptionKey);
            return encrypted.toString();
        } catch (error) {
            console.error('Encryption error:', error);
            throw new Error('Failed to encrypt data');
        }
    }

    /**
     * Decrypt an AES-256 encrypted string
     */
    public decrypt(ciphertext: string): string {
        if (!config.security.encryptionEnabled) {
            return ciphertext;
        }

        try {
            const decrypted = CryptoJS.AES.decrypt(ciphertext, this.encryptionKey);
            return decrypted.toString(CryptoJS.enc.Utf8);
        } catch (error) {
            console.error('Decryption error:', error);
            throw new Error('Failed to decrypt data');
        }
    }

    /**
     * Encrypt sensitive fields in an object
     */
    public encryptFields<T extends Record<string, any>>(
        data: T,
        fieldsToEncrypt: (keyof T)[]
    ): T & { _encryptedFields?: string[] } {
        if (!config.security.encryptionEnabled) {
            return data;
        }

        const encrypted = { ...data };
        const encryptedFieldsList: string[] = [];

        fieldsToEncrypt.forEach((field) => {
            if (data[field] && typeof data[field] === 'string') {
                encrypted[field] = this.encrypt(data[field] as string) as T[keyof T];
                encryptedFieldsList.push(field as string);
            }
        });

        return {
            ...encrypted,
            _encryptedFields: encryptedFieldsList,
        };
    }

    /**
     * Decrypt sensitive fields in an object
     */
    public decryptFields<T extends Record<string, any>>(
        data: T & { _encryptedFields?: string[] }
    ): T {
        if (!config.security.encryptionEnabled || !data._encryptedFields) {
            return data;
        }

        const decrypted = { ...data };

        data._encryptedFields.forEach((field) => {
            if (decrypted[field] && typeof decrypted[field] === 'string') {
                (decrypted as any)[field] = this.decrypt(decrypted[field] as string);
            }
        });

        // Remove encryption metadata
        delete decrypted._encryptedFields;

        return decrypted;
    }

    /**
     * Generate a hash for data integrity verification
     */
    public generateHash(data: string): string {
        return CryptoJS.SHA256(data).toString();
    }
}

// Export singleton instance
export const encryptionService = EncryptionService.getInstance();
export default encryptionService;
