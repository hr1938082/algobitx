import { join } from "node:path";
import Command from "../../Core/Command";
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import GitHubDownloader from "../../Core/GitHubDownloader";
import PackagesURLFactory from "../../Core/PackagesURLFactory";
import { extract } from 'tar';
import PackageManifest from "../../Core/PackageManifest";
import PackageFullPathFactory from "../../Core/PackageFullPathFactory";

class Application extends Command {

    readonly name = "new";

    readonly description = "Create and initialize an AlgobitX new Application.";

    private validateApplicationName(
        applicationName: string | undefined,
    ): asserts applicationName is string {

        if (!applicationName) {
            throw new Error(
                "Application name is required.",
            );
        }

        if (!/^[a-z][a-z0-9-_]*$/.test(applicationName)) {
            throw new Error(
                `Invalid application name "${applicationName}". ` +
                `Use lowercase letters, numbers, "-" or "_".`,
            );
        }
    }

    private updatePackageName(applicationPath: string, applicationName: string) {
        const packageJsonPath = join(
            applicationPath,
            "package.json",
        );

        if (!existsSync(packageJsonPath)) {
            throw new Error(
                "Application skeleton does not contain package.json.",
            );
        }


        const packageJson = JSON.parse(
            readFileSync(
                packageJsonPath,
                "utf8",
            ),
        );

        packageJson.name = applicationName;

        writeFileSync(
            packageJsonPath,
            `${JSON.stringify(packageJson, null, 4)}\n`,
        );
    }

    private async create(...args: string[]) {
        const applicationName = args[0];

        this.validateApplicationName(applicationName);

        const applicationPath = join(this.path, applicationName);

        if (!existsSync(applicationPath))
            mkdirSync(applicationPath, { recursive: true });

        const temporaryPath = join(tmpdir(), `${applicationName}-${Date.now()}`);

        mkdirSync(temporaryPath, { recursive: true });

        const archivePath = join(temporaryPath, 'skeleton.tar.gz');

        const extractionPath = join(temporaryPath, 'extracted');

        mkdirSync(extractionPath);

        console.log(`Downloading AlgobitX Application skeleton...`);

        try {
            await GitHubDownloader(PackagesURLFactory('app'), archivePath);

            console.log(`Extracting AlgobitX Application skeleton...`);

            await extract({ file: archivePath, cwd: extractionPath })

            const packageFullPath = PackageFullPathFactory('app');

            const extractedSkeletonPath = join(extractionPath, packageFullPath);

            cpSync(extractedSkeletonPath, applicationPath, { recursive: true });

            this.updatePackageName(applicationPath, applicationName);
        } catch (error) {
            if (existsSync(applicationPath)) rmSync(applicationPath, {
                recursive: true,
                force: true,
            });

            throw error;
        } finally {
            if (existsSync(temporaryPath)) rmSync(temporaryPath, {
                recursive: true,
                force: true,
            });
        }
    }

    override async execute(...args: string[]): Promise<void> {
        console.log(`Initializing AlgobitX Application`);

        await this.create(...args);

        console.log(`Application initialized at ${this.path}`);
    }
}

export default Application;