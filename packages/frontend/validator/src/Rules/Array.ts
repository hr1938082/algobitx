import { Validate } from "../Meta";

const Array: Validate = (value: unknown): boolean =>
    globalThis.Array.isArray(value);

export default Array