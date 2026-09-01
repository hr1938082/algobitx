import Required from "../Public/Required";
import KeyValueCheck from "./KeyValueCheck";

const RequiredIfNot = <
    T extends Record<string, unknown>
>(
    value: unknown,
    values: T,
    ...params: [keyof T, unknown] | [keyof T, unknown][]
) => {
    const newParams = (
        Array.isArray(params[0])
            ? params
            : [params]
    ) as [keyof T, unknown][];
    if (KeyValueCheck(values, true, ...newParams)) return Required(value);
    return true;
}

export default RequiredIfNot