import { Validate } from "../../Meta"
import Accepted from "../Public/Accepted";
import KeyValueCheck from "./KeyValueCheck";

const AcceptedUnless: Validate = (value: unknown, values: unknown, ...params: unknown[]): boolean => {
    if (KeyValueCheck(values, ...params)) return Accepted(value);
    return true;
}

export default AcceptedUnless