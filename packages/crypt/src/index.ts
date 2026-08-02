import { createCipheriv, createDecipheriv, createHash, randomBytes, CipherGCM, DecipherGCM } from "node:crypto";
import Config from "@algobitx/config-loader";

class Crypt {
    private static algorithm = "aes-256-gcm";
    private static key: Buffer | null = null;

    static getKey(): Buffer {
        if (this.key) return this.key;
        const secret = Config("app.key");
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
        const key = this.getKey();
        const [ivHex, encryptedHex, authTagHex] = data.split(":");

        const iv = Buffer.from(ivHex, "hex");
        const encryptedText = Buffer.from(encryptedHex, "hex");
        const authTag = Buffer.from(authTagHex, "hex");

        const decipher = createDecipheriv(this.algorithm, key, iv) as DecipherGCM;
        decipher.setAuthTag(authTag);

        const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
        return decrypted.toString("utf8");
    }
}

export default Crypt;
