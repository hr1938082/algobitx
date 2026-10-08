import { createWriteStream } from "node:fs";
import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";

const GitHubDownloader = async (url: string, destination: string) => {
    console.log(`Downloading from ${url} to ${destination}...`);
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(
            `Failed to download GitHub archive. ` +
            `HTTP ${response.status} ${response.statusText}`
        );
    }

    if (!response.body) {
        throw new Error(
            "GitHub returned an empty response."
        );
    }

    await mkdir(dirname(destination), {
        recursive: true
    });

    const destinationStream = createWriteStream(destination);

    try {
        const reader = response.body.getReader();

        while (true) {
            const { done, value } = await reader.read();

            if (done) break;

            if (!destinationStream.write(value)) {
                await new Promise<void>((resolve) => {
                    destinationStream.once("drain", resolve);
                });
            }
        }

        destinationStream.end();

        await new Promise<void>((resolve, reject) => {
            destinationStream.once("finish", resolve);
            destinationStream.once("error", reject);
        });

    } catch (error) {
        throw error;
    }
}

export default GitHubDownloader