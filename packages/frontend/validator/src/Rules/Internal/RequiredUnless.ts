import { Validate } from "../../Meta"
import Required from "../Public/Required";
import KeyValueCheck from "./KeyValueCheck";

const RequiredUnless: Validate = (value: unknown, values: unknown, ...params: unknown[]): boolean => {
    if (KeyValueCheck(values, ...params)) return Required(value);
    return true;
}

export default RequiredUnless