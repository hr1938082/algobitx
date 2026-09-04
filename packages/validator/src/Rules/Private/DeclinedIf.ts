import Declined from "../Public/Declined";
import KeyValueCheck from "./KeyValueCheck";

const DeclinedIf = <
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
    if (KeyValueCheck(values, false, ...newParams)) return Declined(value);
    return true;
}

export default DeclinedIf