import { Path } from "../..";
import Declined from "../Public/Declined";
import KeyValueCheck from "./KeyValueCheck";

const DeclinedIfNot = <
    T extends object
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
    if (KeyValueCheck(values, true, ...newParams)) return Declined(value);
    return true;
}

export default DeclinedIfNot