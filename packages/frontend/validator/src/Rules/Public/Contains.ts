import { Validate } from "../../Meta";
import Array from "./Array";
import String from "./String";

const Contains: Validate = (value: unknown, ...params: unknown[]): boolean =>
    (String(value) || Array(value)) && params.every(p => String(p) && value.includes(p));

export default Contains;