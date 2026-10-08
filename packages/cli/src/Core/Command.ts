import { existsSync } from "node:fs";
import { join } from "node:path";

abstract class Command {

    abstract readonly name: string;

    abstract readonly description: string;

    constructor(protected readonly path: string) { }

    public exists(): boolean {
        return existsSync(this.path);
    }

    public hasPackageJson(): boolean {
        return existsSync(join(this.path, "package.json"));
    }

    abstract execute(
        ...args: string[]
    ): Promise<void>;

}

export default Command;