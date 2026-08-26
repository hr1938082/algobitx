import { Validate } from "../Meta"

const Array: Validate = (value: unknown, params: string[]): boolean => {
    if (globalThis.Array.isArray(value)) return true;
    return false;
}

export default Array