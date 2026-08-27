import { Validate } from "../../Meta"
import Declined from "../Public/Declined";
import PlainObject from "../Public/PlainObject";
import String from "../Public/String";

const DeclinedIfDeclined: Validate = (value: unknown, values: unknown, ...params: unknown[]): boolean => {
    if (params.length === 0) throw new Error("Invalid keys");
    if (!PlainObject(values)) throw new Error("Invalid Values");

    for (const key of params) {
        if (!String(key)) throw new Error(`Invalid Key expecting string found ${key}`);
        if (!Declined(values[key])) return false;
    }
    if (!Declined(value)) return false;
    return true;
}

export default DeclinedIfDeclined