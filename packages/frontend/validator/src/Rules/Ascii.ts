import { Validate } from "../Meta";
import String from "./String";

const Ascii: Validate = (value: unknown, params: string[]): boolean =>
    String(value, params) && new RegExp("^[\\x00-\\x7F]+$").test(value);

export default Ascii;