import { Validate } from "../Meta"
import String from "./String";

const Alpha: Validate = (value: unknown, params: string[]): boolean => {
    const regex = new RegExp("^[A-Za-z]+$");
    if (String(value, params) && regex.test(value)) return true;
    return false;
}

export default Alpha