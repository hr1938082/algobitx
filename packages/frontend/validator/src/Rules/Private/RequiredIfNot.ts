import Required from "../Public/Required";
import KeyValueCheck from "./KeyValueCheck";

const RequiredIfNot = <
    T extends Record<string, unknown>
>(
    value: unknown,
    values: T,
    ...params: [keyof T, unknown][]
) => {
    if (KeyValueCheck(values, true, ...params)) return Required(value);
    return true;
}

export default RequiredIfNot