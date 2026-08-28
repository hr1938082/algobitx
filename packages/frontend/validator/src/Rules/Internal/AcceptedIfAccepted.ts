import { Validate } from "../../Meta"
import Accepted from "../Public/Accepted";
import PlainObject from "../Public/PlainObject";
import String from "../Public/String";

const AcceptedIfAccepted: Validate = (value: unknown, values: unknown, ...params: unknown[]): boolean => {
    if (params.length === 0) throw new Error("Invalid keys");
    if (!PlainObject(values)) throw new Error("Invalid Values");

    for (const key of params) {
        if (!String(key)) throw new Error(`Invalid Key expecting string found ${key}`);
        if (!Accepted(values[key])) return true;
    }

    return Accepted(value);
}

export default AcceptedIfAccepted