import BootException from "@algobitx/exception/server/BootException";

const DynamicRouteKey = (path: string) => {
    return path.replace(/\{([^}]+)\}/g, (_, name) => {
        if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
            throw new BootException(
                new Error(`Invalid route parameter: {${name}}`)
            );
        }

        return "{}";
    });
}

export default DynamicRouteKey