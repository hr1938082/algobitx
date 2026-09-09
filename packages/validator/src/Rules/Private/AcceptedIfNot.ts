import { Path } from "../..";
import Accepted from "../Public/Accepted";
import KeyValueCheck from "./KeyValueCheck";

const AcceptedIfNot = <
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
    if (KeyValueCheck(values, true, ...newParams)) return Accepted(value);
    return true;
}
export default AcceptedIfNot