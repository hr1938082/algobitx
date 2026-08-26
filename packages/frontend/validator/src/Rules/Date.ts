import { Validate } from "../Meta";
import String from "./String";

const Date: Validate = (value: unknown): boolean => {
    if (!String(value)) return false;
    const date = new globalThis.Date(value);
    if (!isNaN(date.getTime())) return false;
    return true;
}

export default Date;