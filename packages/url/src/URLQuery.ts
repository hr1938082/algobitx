class URLQuery {
    private params: URLSearchParams;

    constructor(init?: string[][] | Record<string, string> | string | URLSearchParams) {
        this.params = new URLSearchParams(init);
    }

    get(key: string): string | string[] | undefined {
        const values = this.params.getAll(key);
        return values.length > 1 ? values : values[0] ?? undefined;
    }

    only<K extends string>(...keys: K[]): Record<K, string | string[] | undefined> {

        const result: Record<string, string | string[] | undefined> = {};

        if (this.params.size === 0) return result;

        for (const key of keys) {
            const values = this.params.getAll(key);
            result[key] = values.length > 1 ? values : values[0] ?? undefined;
        }

        return result;
    }

    all<T extends Record<string, string | string[] | undefined>>(): T {
        const result: Record<string, string | string[] | undefined> = {};

        if (this.params.size === 0) return result as T;

        const keys = new Set(this.params.keys());

        for (const k of keys) {
            const values = this.params.getAll(k);
            result[k] = values.length > 1 ? values : values[0] ?? undefined;
        }

        return result as T;
    }

    append(key: string, value: string) {
        this.params.append(key, value);
    }

    set(key: string, value: string) {
        this.params.set(key, value);
    }

    has(key: string) {
        return this.params.has(key);
    }

    delete(key: string) {
        this.params.delete(key);
    }

    toString() {
        return this.params.toString();
    }

    get size() {
        return this.params.size;
    }

    get entries() {
        return this.params.entries();
    }

    get keys() {
        return this.params.keys();
    }

    get values() {
        return this.params.values();
    }

    [Symbol.iterator]() {
        return this.entries;
    }

}

export default URLQuery;