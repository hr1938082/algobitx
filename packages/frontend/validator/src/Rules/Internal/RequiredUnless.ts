import { Validate } from "../../Meta"
import Required from "../Public/Required";
import KeyValueCheck from "./KeyValueCheck";

const RequiredUnless: Validate = (value: unknown, values: unknown, ...params: unknown[]): boolean =>
    KeyValueCheck(values, ...params) && Required(value);

export default RequiredUnless