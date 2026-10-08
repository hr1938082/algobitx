import Command from "./Command";

class CommandRegistery {
    private readonly commands = new Map<string, Command>();

    register(command: Command): void {
        if (this.commands.has(command.name)) {
            throw new Error(
                `Command "${command.name}" is already registered.`
            );
        }

        this.commands.set(command.name, command);
    }

    get(name: string): Command | undefined {
        return this.commands.get(name);
    }

    all(): Command[] {
        return [...this.commands.values()];
    }
}

export default CommandRegistery;