import Required from "../Public/Required";
import KeyValueCheck from "./KeyValueCheck";

const RequiredIf = <
    T extends Record<string, unknown>
>(
    value: unknown,
    values: T,
    ...params: [keyof T, unknown][]
) => {
    if (KeyValueCheck(values, false, ...params)) return Required(value);
    return true;
}

export default RequiredIf