import { Validate } from "../Meta";
import String from "./String";

const Ascii: Validate = (value: unknown): boolean =>
    String(value) && new RegExp("^[\\x00-\\x7F]+$").test(value);

export default Ascii;