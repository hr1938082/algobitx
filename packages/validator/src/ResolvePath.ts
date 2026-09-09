import { Path } from ".";
import PlainObject from "./Rules/Public/PlainObject";
import UnsafeKeys from "./UnsafeKeys";

const ResolvePath = <T extends object>(values: T, path: string) => {
    const segments = path.split('.');

    const result: { path: Path<T>, value: unknown, resolved: boolean }[] = [];

    const walk = (curr: unknown, i: number, currPath: string[]) => {
        if (i === segments.length) {
            result.push({
                path: currPath.join(".") as Path<T>,
                value: curr,
                resolved: true
            });
            return;
        }

        const segment = segments[i];

        if (UnsafeKeys.has(segment))
            throw new Error(`Unsafe validation path: ${path}`);

        if (segment === '*') {
            if (Array.isArray(curr) && curr.length > 0) {
                for (let index = 0; index < curr.length; index++)
                    walk(curr[index], i + 1, [...currPath, String(index)]);
                return;
            }
            if (PlainObject(curr) && Object.keys(curr).length > 0) {
                for (const [key, value] of Object.entries(curr))
                    walk(value, i + 1, [...currPath, key]);
                return;
            } else return;
        } else if (
            curr !== null &&
            typeof curr === 'object' &&
            Object.prototype.hasOwnProperty.call(curr, segment)
        ) {
            walk(
                (curr as Record<string, unknown>)[segment],
                i + 1,
                [...currPath, segment]
            );
            return;
        }

        const remainingPath = segments.slice(i);

        result.push({
            path: [...currPath, ...remainingPath].join(".") as Path<T>,
            value: undefined,
            resolved: !remainingPath.includes('*')
        });

    }

    walk(values, 0, []);

    return result;
}

export default ResolvePath