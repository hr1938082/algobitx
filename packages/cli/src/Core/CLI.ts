import CommandRegistery from "./CommandRegistery";

class CLI {
    public constructor(
        private readonly registry: CommandRegistery
    ) { }

    async run(
        ...args: string[]
    ): Promise<void> {

        const [commandName, ...commandArgs] = args;

        if (!commandName) {
            this.help();
            return;
        }

        const command = this.registry.get(commandName);

        if (!command) {
            throw new Error(
                `Unknown command "${commandName}".`
            );
        }


        await command.execute(...commandArgs);
    }

    private help(): void {
        console.log("AlgobitX CLI");

        for (const command of this.registry.all()) {
            console.log(
                `  ${command.name.padEnd(24)} ${command.description}`
            );
        }
    }
}

export default CLI;