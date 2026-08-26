import { Validate } from "../Meta";
import Array from "./Array";
import String from "./String";

const Contains: Validate = (value: unknown, ...params: string[]): boolean =>
    (String(value) || Array(value)) && params.every(p => value.includes(p));

export default Contains;