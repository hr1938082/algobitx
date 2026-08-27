import { Validate } from "../../Meta"
import Declined from "../Public/Declined";
import KeyValueCheck from "./KeyValueCheck";

const DeclinedUnless: Validate = (value: unknown, values: unknown, ...params: unknown[]): boolean =>
    KeyValueCheck(values, ...params) && Declined(value);

export default DeclinedUnless