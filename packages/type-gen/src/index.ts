import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";

export interface EmitDeclarationOptions {
    name: string;
    default?: boolean;
}

export interface WriteConfig {
    name?: string;
    path: string;
    comparison?: boolean;
}

export interface WriteToFileOptions {
    export: EmitDeclarationOptions;
    write: WriteConfig;
}

class TypeGen {
    private static readonly RESERVED_WORDS = new Set([
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

    private static indent(n: number) {
        return '    '.repeat(n);
    }

    /**
     * Generates a TypeScript type representation from a JavaScript value.
     *
     * Supports:
     * - Primitive types
     * - Objects
     * - Arrays
     * - Union arrays
     *
     * @param value The value to analyze.
     * @param depth Internal indentation level. You normally don't need to provide this.
     * @returns A TypeScript type as a string.
     *
     * @example
     * TypeGen.generate({
     *   id: 1,
     *   name: "John",
     *   active: true
     * });
     *
     * // {
     * //     id: number;
     * //     name: string;
     * //     active: boolean;
     * // }
     */
    static generate(value: unknown, depth: number = 0, seen: WeakSet<object> = new WeakSet()): string {
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

    private static emitType(value: unknown, options: EmitDeclarationOptions): string {
        const keyword = options.default ? "export default" : "export";
        const types = this.generate(value);
        return `${keyword} type ${options.name} = ${types};\n`;
    }

    private static emitInterface(value: unknown, options: EmitDeclarationOptions): string {

        const keyword = options.default ? "export default" : "export";
        const types = this.generate(value);
        return `${keyword} interface ${options.name} ${types}\n`;
    }

    private static isPlainObject(value: unknown): value is Record<string, unknown> {
        if (value === null || typeof value !== "object") return false;

        const prototype = Object.getPrototypeOf(value);
        return prototype === Object.prototype || prototype === null;
    }

    /**
     * Generates either a TypeScript type or interface declaration.
     *
     * Plain objects are emitted as interfaces.
     * All other values are emitted as type aliases.
     *
     * @param value The value used to infer the declaration.
     * @param options Declaration configuration.
     * @returns A TypeScript type or interface declaration.
     *
     * @example
     * TypeGen.emitDeclaration(
     *   { id: 1 },
     *   {
     *     name: "User"
     *   }
     * );
     */
    static emitDeclaration(value: unknown, options: EmitDeclarationOptions) {
        if (
            !/^[A-Za-z_$][\w$]*$/.test(options.name) &&
            !this.RESERVED_WORDS.has(options.name)
        ) throw new TypeError(
            `Invalid TypeScript declaration name: ${options.name}`
        );

        return this.isPlainObject(value)
            ? this.emitInterface(value, options)
            : this.emitType(value, options);
    }

    /**
     * Generates a declaration file (.d.ts) and writes it to disk.
     *
     * By default the file name is the exported declaration name.
     * You can override it using `write.name`.
     *
     * When `comparison` is enabled, the file is only rewritten if
     * the generated content has changed.
     *
     * @param value The value used to generate the declaration.
     * @param options Export and file writing configuration.
     *
     * @example
     * TypeGen.writeToFile(
     *   {
     *     id: 1,
     *     name: "John"
     *   },
     *   {
     *     export: {
     *       name: "User"
     *     },
     *     write: {
     *       path: "./types",
     *       comparison: true
     *     }
     *   }
     * );
     */
    static writeToFile(value: unknown, options: WriteToFileOptions): void {
        const { export: exportOptions, write } = options;

        const rawName = write.name ?? exportOptions.name;

        const fileName = rawName.endsWith(".d.ts") ? rawName : `${rawName}.d.ts`;

        if (basename(fileName) !== fileName) throw new Error(
            "Write name must not contain path separators."
        );

        mkdirSync(write.path, { recursive: true });

        const outPath = join(write.path, fileName);
        const dtsContent = this.emitDeclaration(value, exportOptions);

        if (write.comparison && existsSync(outPath)) {
            const oldContent = readFileSync(outPath, { encoding: "utf-8" });
            if (oldContent === dtsContent) return;
        }

        writeFileSync(outPath, dtsContent, "utf8");
    }

}

export default TypeGen