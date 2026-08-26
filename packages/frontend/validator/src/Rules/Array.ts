import { Validate } from "../Meta";

const Array: Validate = (value: unknown, params: string[]): boolean =>
    globalThis.Array.isArray(value);

export default Array