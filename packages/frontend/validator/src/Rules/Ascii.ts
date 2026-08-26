import { Validate } from "../Meta"
import String from "./String";

const Ascii: Validate = (value: unknown, params: string[]): boolean => {
    const regex = new RegExp("^[\\x00-\\x7F]+$");
    if (String(value, params) && regex.test(value)) return true;
    return false;
}

export default Ascii