import { Validate } from "../../Meta"
import Accepted from "../Public/Accepted";
import KeyValueCheck from "./KeyValueCheck";

const AcceptedUnless: Validate = (value: unknown, values: unknown, ...params: unknown[]): boolean =>
    KeyValueCheck(values, ...params) && Accepted(value);

export default AcceptedUnless