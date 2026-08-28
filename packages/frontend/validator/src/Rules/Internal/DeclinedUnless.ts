import { Validate } from "../../Meta"
import Declined from "../Public/Declined";
import KeyValueCheck from "./KeyValueCheck";

const DeclinedUnless: Validate = (value: unknown, values: unknown, ...params: unknown[]): boolean => {
    if (KeyValueCheck(values, ...params)) return Declined(value);
    return true;
}

export default DeclinedUnless