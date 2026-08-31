import Required from "../Public/Required";
import KeyValueCheck from "./KeyValueCheck";

const RequiredUnless = <
    T extends Record<string, unknown>
>(
    value: unknown,
    values: T,
    ...params: [keyof T, unknown][]
) => {
    if (KeyValueCheck(values, ...params)) return Required(value);
    return true;
}

export default RequiredUnless