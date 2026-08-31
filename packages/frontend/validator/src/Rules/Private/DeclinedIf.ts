import Declined from "../Public/Declined";
import KeyValueCheck from "./KeyValueCheck";

const DeclinedIf = <
    T extends Record<string, unknown>
>(
    value: unknown,
    values: T,
    ...params: [keyof T, unknown][]
) => {
    if (KeyValueCheck(values, false, ...params)) return Declined(value);
    return true;
}

export default DeclinedIf