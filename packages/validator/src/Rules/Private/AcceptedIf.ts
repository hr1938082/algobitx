import Accepted from "../Public/Accepted";
import KeyValueCheck from "./KeyValueCheck";

const AcceptedIf = <
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
    if (KeyValueCheck(values, false, ...newParams)) return Accepted(value);
    return true;
}
export default AcceptedIf