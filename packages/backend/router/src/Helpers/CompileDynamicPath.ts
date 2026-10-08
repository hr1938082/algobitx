import BootException from "@bitx/exception/server/BootException";

const CompileDynamicPath = (path: string) => {
    const params: string[] = [];
    const seen = new Set<string>();

    const escapeRegex = (value: string) =>
        value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    let pattern = "";
    let lastIndex = 0;

    for (const match of path.matchAll(/\{([^}]+)\}/g)) {

        const fullMatch = match[0];
        const name = match[1];
        const index = match.index!;

        pattern += escapeRegex(
            path.slice(lastIndex, index)
        );

        if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
            throw new BootException(
                new Error(`Invalid route parameter: {${name}}`)
            );
        }

        if (seen.has(name)) {
            throw new BootException(
                new Error(`Duplicate route parameter: {${name}}`)
            );
        }

        seen.add(name);
        params.push(name);

        pattern += "([^/]+)";
        lastIndex = index + fullMatch.length;
    }

    pattern += escapeRegex(path.slice(lastIndex));

    return {
        regex: new RegExp(`^${pattern}$`),
        params
    };
}

export default CompileDynamicPath