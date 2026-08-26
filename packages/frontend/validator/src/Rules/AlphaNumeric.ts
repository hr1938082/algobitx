import { Validate } from "../Meta"
import String from "./String";

const AlphaNumeric: Validate = (value: unknown, params: string[]): boolean => {
    const regex = new RegExp("^[A-Za-z0-9]+$");
    if (String(value, params) && regex.test(value)) return true;
    return false;
}

export default AlphaNumeric