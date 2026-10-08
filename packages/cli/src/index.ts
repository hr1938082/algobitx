import Framework from "./Commands/Install/Application";
import CLI from "./Core/CLI";
import CommandRegistery from "./Core/CommandRegistery";

const registry = new CommandRegistery();

registry.register(new Framework(process.cwd()));

const cli = new CLI(registry);

async function main(): Promise<void> {
    await cli.run(...process.argv.slice(2));
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});