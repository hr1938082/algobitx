import { existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export interface BaseEmitOptions {
    name: string;
    default?: boolean;
}

export interface EmitDeclarationOptions extends BaseEmitOptions {
    type: 'type' | 'interface';
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
     * - Tuples (for small heterogeneous arrays)
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
    static generate(value: unknown, depth: number = 0): string {
        if (value === null) return "null";
        if (value === undefined) return "undefined";

        const type = typeof value;

        if (type === 'string') return 'string';
        if (type === 'number') return 'number';
        if (type === 'bigint') return 'bigint';
        if (type === 'boolean') return 'boolean';
        if (type === "symbol") return "symbol";

        if (type === "object") {
            if (Buffer.isBuffer(value)) {
                return "Buffer";
            } else if (value instanceof RegExp) {
                return "RegExp";
            } else if (value instanceof Date) {
                return "Date";
            } else if (value instanceof URL) {
                return "URL";
            } else if (value instanceof Map) {
                if (value.size === 0) return "Map<unknown,unknown>";

                const keyTypes = new Set();
                const valueTypes = new Set();

                for (const [key, val] of value.entries()) {
                    keyTypes.add(this.generate(key));
                    valueTypes.add(this.generate(val));
                }

                return `Map<${[...keyTypes].join(" | ")}, ${[...valueTypes].join(" | ")}>`;
            } else if (value instanceof Set) {
                if (value.size === 0) return "Set<unknown>";

                const types = new Set();

                for (const item of value)
                    types.add(this.generate(item, depth + 1));

                return `Set<${[...types].join(" | ")}>`;
            } else if (Array.isArray(value)) {
                if (value.length === 0) return "unknown[]";

                const elementTypes: string[] = Array.from(
                    new Set(
                        value.map((v: unknown) =>
                            this.generate(v, depth + 1)
                        )
                    )
                );

                if (elementTypes.length === 1)
                    return `${elementTypes[0]}[]`;

                if (value.length <= 5) {
                    const tuple = value.map((v: unknown) =>
                        this.generate(v, depth + 1)
                    );
                    return `[${tuple.join(", ")}]`;
                } else {
                    return `(${elementTypes.join(" | ")})[]`;
                }
            } else {
                const obj = value as Record<string, unknown>
                const keys = Object.keys(obj);

                if (keys.length === 0) return "{ [key: string]: unknown }";

                const fields: string[] = keys.map((k) => {
                    const safeKey = /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(k)
                        ? k
                        : JSON.stringify(k);

                    return `${this.indent(depth + 1)}${safeKey}: ${this.generate(
                        obj[k],
                        depth + 1
                    )};`;
                });

                return `{\n${fields.join("\n")}\n${this.indent(depth)}}`;
            }
        }

        return "unknown";
    }


    /**
     * Generates an exported TypeScript type declaration.
     *
     * @param value The value used to infer the type.
     * @param options Configuration for the generated type.
     * @returns A complete TypeScript type declaration.
     *
     * @example
     * TypeGen.emitType(
     *   { id: 1, name: "John" },
     *   { name: "User" }
     * );
     *
     * // export type User = {
     * //     id: number;
     * //     name: string;
     * // };
     */
    static emitType(value: any, options: BaseEmitOptions): string {
        const keyword = options.default ? "export default" : "export";
        const types = this.generate(value);
        return `${keyword} type ${options.name} = ${types};`;
    }

    /**
     * Generates an exported TypeScript interface declaration.
     *
     * @param value The value used to infer the interface.
     * @param options Configuration for the generated interface.
     * @returns A complete TypeScript interface declaration.
     *
     * @example
     * TypeGen.emitInterface(
     *   { id: 1, name: "John" },
     *   { name: "User" }
     * );
     *
     * // export interface User {
     * //     id: number;
     * //     name: string;
     * // }
     */
    static emitInterface(value: any, options: BaseEmitOptions): string {
        const keyword = options.default ? "export default" : "export";
        const types = this.generate(value);
        return `${keyword} interface ${options.name} ${types}`;
    }

    /**
     * Generates either a TypeScript type or interface declaration.
     *
     * The declaration type is determined by the `type` property
     * in the provided options.
     *
     * @param value The value used to infer the declaration.
     * @param options Declaration configuration.
     * @returns A TypeScript type or interface declaration.
     *
     * @example
     * TypeGen.emitDeclaration(
     *   { id: 1 },
     *   {
     *     type: "interface",
     *     name: "User"
     *   }
     * );
     */
    static emitDeclaration(value: any, options: EmitDeclarationOptions) {
        return options.type === 'type'
            ? this.emitType(value, options)
            : this.emitInterface(value, options);
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
     *       type: "interface",
     *       name: "User"
     *     },
     *     write: {
     *       path: "./types",
     *       comparison: true
     *     }
     *   }
     * );
     */
    static writeToFile(value: any, options: WriteToFileOptions): void {
        const { export: exportOptions, write } = options;

        const outPath = join(write.path, `${write.name ?? exportOptions.name}.d.ts`);
        const outExists = existsSync(outPath);

        let oldContent = "";
        if (outExists) {
            oldContent = readFileSync(outPath, { encoding: "utf-8" });
        }

        const dtsContent = this.emitDeclaration(value, exportOptions);

        if (write.comparison && oldContent.trim() === dtsContent.trim()) {
            return;
        }

        if (outExists) {
            try {
                unlinkSync(outPath);
            } catch (err) {
                console.warn(`Failed to delete existing ${outPath}:`, err);
            }
        }

        writeFileSync(outPath, dtsContent, "utf8");
    }

}

export default TypeGen