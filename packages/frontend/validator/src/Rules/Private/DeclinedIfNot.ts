import Declined from "../Public/Declined";
import KeyValueCheck from "./KeyValueCheck";

const DeclinedIfNot = <
    T extends Record<string, unknown>
>(
    value: unknown,
    values: T,
    ...params: [keyof T, unknown][]
) => {
    if (KeyValueCheck(values, true, ...params)) return Declined(value);
    return true;
}

export default DeclinedIfNot