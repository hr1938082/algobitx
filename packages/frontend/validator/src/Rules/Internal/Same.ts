import { Validate } from "../../Meta"
import Accepted from "../Public/Accepted";
import PlainObject from "../Public/PlainObject";
import String from "../Public/String";

const Same: Validate = (value: unknown, values: unknown, ...params: unknown[]): boolean => {
    if (params.length !== 1) throw new Error(`Invalid keys expecting 1 found ${params.length}`);
    if (!PlainObject(values)) throw new Error("Invalid Values");

    const key = params[0];
    if (!String(key)) throw new Error(`Invalid Key expecting string found ${key}`);

    if (value !== values[key]) return false;
    return true;
}

export default Same