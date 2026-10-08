import { createCipheriv, createDecipheriv, createHash, randomBytes, CipherGCM, DecipherGCM } from "node:crypto";
import Config from "@bitx/config-loader";
import InternalServerException from "@bitx/exception/http/InternalServerException";

class Crypt {
    private static algorithm = "aes-256-gcm";
    private static key: Buffer | null = null;

    static getKey(): Buffer {
        if (this.key) return this.key;
        const secret = Config("app.key");

        if (typeof secret !== "string" || secret.length === 0)
            throw new InternalServerException(
                new TypeError(
                    "Config 'app.key' must be a non-empty string."
                )
            );

        this.key = createHash("sha256").update(secret).digest();
        return this.key;
    }

    static encrypt(data: string): string {
        const key = this.getKey();
        const iv = randomBytes(12);

        const cipher = createCipheriv(this.algorithm, key, iv) as CipherGCM;
        const encrypted = Buffer.concat([cipher.update(data, "utf8"), cipher.final()]);
        const authTag = cipher.getAuthTag();

        return [
            iv.toString("hex"),
            encrypted.toString("hex"),
            authTag.toString("hex"),
        ].join(":");
    }

    static decrypt(data: string): string {
        if (typeof data !== "string" || data.length === 0)
            throw new InternalServerException(
                new TypeError("Encrypted data must be a non-empty string.")
            );

        const parts = data.split(":");
        if (parts.length !== 3) throw new InternalServerException(
            new TypeError("Invalid encrypted data format.")
        );

        const [ivHex, encryptedHex, authTagHex] = parts;

        if (!ivHex || !encryptedHex || !authTagHex)
            throw new InternalServerException(
                new TypeError("Invalid encrypted data format.")
            );

        const hexPattern = /^[0-9a-f]+$/i;

        if (
            !hexPattern.test(ivHex) ||
            !hexPattern.test(encryptedHex) ||
            !hexPattern.test(authTagHex)
        ) throw new InternalServerException(
            new TypeError("Invalid encrypted data encoding.")
        );


        const iv = Buffer.from(ivHex, "hex");
        const encryptedText = Buffer.from(encryptedHex, "hex");
        const authTag = Buffer.from(authTagHex, "hex");
        const key = this.getKey();

        if (iv.length !== 12) throw new InternalServerException(
            new TypeError("Invalid encryption IV.")
        );

        if (authTag.length !== 16) throw new InternalServerException(
            new TypeError("Invalid authentication tag.")
        );

        try {
            const decipher = createDecipheriv(this.algorithm, key, iv) as DecipherGCM;
            decipher.setAuthTag(authTag);

            const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
            return decrypted.toString("utf8");
        } catch (error) {
            throw new InternalServerException(error);
        }
    }
}

export default Crypt;
