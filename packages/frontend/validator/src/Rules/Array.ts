import { Validate } from "../Meta";

const Array = (value: unknown): value is unknown[] =>
    globalThis.Array.isArray(value);

export default Array