import { join } from "node:path";
import { NamedRouteDefinition } from "../Base";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

class TypeGenerator {

    private indent(level: number) {
        return "    ".repeat(level);
    }

    private safeKey(key: string) {
        return /^[A-Za-z_$][\w$]*$/.test(key)
            ? key
            : JSON.stringify(key);
    }

    private generateType(value: Map<string, NamedRouteDefinition>): string {
        const routeParams: string[] = [];
        value.forEach((definition, key) => {
            const paramsTypeDefinition: string[] = [];
            for (const param of definition.params) {
                const safeParam = this.safeKey(param);
                paramsTypeDefinition.push(`${this.indent(2)}${safeParam}: string;`);
            }
            routeParams.push(`${this.indent(1)}${this.safeKey(key)}: {\n${paramsTypeDefinition.join("\n")}\n${this.indent(1)}};`);
        })
        return `export default interface RouteParams {\n${routeParams.join("\n")}\n}`;
    }

    static writeTypeToFile(value: Map<string, NamedRouteDefinition>) {
        const path = __dirname;
        const fileName = 'RouteParams.d.ts';
        const fullPath = join(path, '../', fileName);
        const typeDefinition = new TypeGenerator().generateType(value);

        if (existsSync(fullPath)) {
            const oldContent = readFileSync(fullPath, { encoding: 'utf-8' });
            if (oldContent === typeDefinition) return;
        }
        writeFileSync(fullPath, typeDefinition, "utf-8");
    }
}

export default TypeGenerator;