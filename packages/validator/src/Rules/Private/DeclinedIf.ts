import { Path } from "../..";
import Declined from "../Public/Declined";
import KeyValueCheck from "./KeyValueCheck";

const DeclinedIf = <
    T extends Record<string, unknown>
>(
    value: unknown,
    values: T,
    ...params: [Path<T>, unknown] | [Path<T>, unknown][]
) => {
    const newParams = (
        Array.isArray(params[0])
            ? params
            : [params]
    ) as [Path<T>, unknown][];
    if (KeyValueCheck(values, false, ...newParams)) return Declined(value);
    return true;
}

export default DeclinedIf