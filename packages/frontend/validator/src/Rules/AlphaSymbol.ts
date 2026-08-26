import { Validate } from "../Meta"
import String from "./String";

const AlphaSymbol: Validate = (value: unknown, params: string[]): boolean => {
    const regex = new RegExp("^[A-Za-z!@#\\$%\\^\\&*\\)\\(+=._-]+$");
    if (String(value, params) && regex.test(value)) return true;
    return false;
}

export default AlphaSymbol