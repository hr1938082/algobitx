import { PlainObject } from "@algobitx/validator/Rules";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";

interface EmitDeclarationOptions {
    name: string;
    default?: boolean;
}

interface WriteConfig {
    name?: string;
    path: string;
    comparison?: boolean;
}

interface WriteToFileOptions {
    export: EmitDeclarationOptions;
    write: WriteConfig;
}
class TypeGen {
    private readonly RESERVED_WORDS = new Set([
        "break", "case", "catch", "class", "const",
        "continue", "debugger", "default", "delete",
        "do", "else", "enum", "export", "extends",
        "false", "finally", "for", "function", "if",
        "import", "in", "instanceof", "new", "null",
        "return", "super", "switch", "this", "throw",
        "true", "try", "typeof", "var", "void",
        "while", "with", "yield",
        "interface", "implements", "package",
        "private", "protected", "public", "static",
        "let", "await", "async", "readonly",
        "keyof", "namespace", "declare", "abstract"
    ]);

    private indent(n: number) {
        return '    '.repeat(n);
    }

    private generate(value: unknown, depth: number = 0, seen: WeakSet<object> = new WeakSet()): string {
        if (value === null) return "null";
        if (value === undefined) return "undefined";

        const type = typeof value;

        if (type === 'string') return 'string';
        if (type === 'number') return 'number';
        if (type === 'bigint') return 'bigint';
        if (type === 'boolean') return 'boolean';
        if (type === "symbol") return "symbol";
        if (type === "function") return "(...args: unknown[]) => unknown";

        if (type === "object") {
            if (seen.has(value)) return "unknown";
            seen.add(value);

            try {

                if (Buffer.isBuffer(value)) return "Buffer";
                if (value instanceof RegExp) return "RegExp";
                if (value instanceof Date) return "Date";
                if (value instanceof URL) return "URL";

                if (value instanceof Map) {
                    if (value.size === 0) return "Map<unknown, unknown>";

                    const keyTypes = new Set<string>();
                    const valueTypes = new Set<string>();

                    for (const [key, val] of value.entries()) {
                        keyTypes.add(this.generate(key, depth + 1, seen));
                        valueTypes.add(this.generate(val, depth + 1, seen));
                    }

                    return `Map<${[...keyTypes].join(" | ")}, ${[...valueTypes].join(" | ")}>`;
                }

                if (value instanceof Set) {
                    if (value.size === 0) return "Set<unknown>";

                    const types = new Set<string>();

                    for (const item of value)
                        types.add(this.generate(item, depth + 1, seen));

                    return `Set<${[...types].join(" | ")}>`;
                }

                if (Array.isArray(value)) {
                    if (value.length === 0) return "unknown[]";

                    const types = value.map((v: unknown) =>
                        this.generate(v, depth + 1, seen)
                    );

                    const elementTypes = [...new Set(types)];

                    if (elementTypes.length === 1) {
                        return `${elementTypes[0]}[]`;
                    }

                    return `(${elementTypes.join(" | ")})[]`;
                }

                const obj = value as Record<string, unknown>
                const keys = Object.keys(obj);

                if (keys.length === 0) return "{ [key: string]: unknown }";

                const fields: string[] = keys.map((k) => {
                    const safeKey = /^[A-Za-z_$][\w$]*$/.test(k)
                        ? k
                        : JSON.stringify(k);

                    return `${this.indent(depth + 1)}${safeKey}: ${this.generate(
                        obj[k],
                        depth + 1,
                        seen
                    )};`;
                });

                return `{\n${fields.join("\n")}\n${this.indent(depth)}}`;

            } finally {
                seen.delete(value);
            }
        }

        return "unknown";
    }

    private emitType(value: unknown, options: EmitDeclarationOptions): string {
        const keyword = options.default ? "export default" : "export";
        const types = this.generate(value);
        return `${keyword} type ${options.name} = ${types};\n`;
    }

    private emitInterface(value: unknown, options: EmitDeclarationOptions): string {

        const keyword = options.default ? "export default" : "export";
        const types = this.generate(value);
        return `${keyword} interface ${options.name} ${types}\n`;
    }

    private emitDeclaration(value: unknown, options: EmitDeclarationOptions) {
        if (
            !/^[A-Za-z_$][\w$]*$/.test(options.name) ||
            this.RESERVED_WORDS.has(options.name)
        ) throw new TypeError(
            `Invalid TypeScript declaration name: ${options.name}`
        );

        return PlainObject(value)
            ? this.emitInterface(value, options)
            : this.emitType(value, options);
    }

    static writeToFile(value: unknown, options: WriteToFileOptions): void {
        const { export: exportOptions, write } = options;

        const rawName = write.name ?? exportOptions.name;

        const fileName = rawName.endsWith(".d.ts") ? rawName : `${rawName}.d.ts`;

        if (basename(fileName) !== fileName) throw new Error(
            "Write name must not contain path separators."
        );

        mkdirSync(write.path, { recursive: true });

        const outPath = join(write.path, fileName);
        const typeGen = new TypeGen();
        const dtsContent = typeGen.emitDeclaration(value, exportOptions);

        if (write.comparison && existsSync(outPath)) {
            const oldContent = readFileSync(outPath, { encoding: "utf-8" });
            if (oldContent === dtsContent) return;
        }

        writeFileSync(outPath, dtsContent, "utf8");
    }
}

export default TypeGen;