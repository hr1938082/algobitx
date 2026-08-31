import Accepted from "../Public/Accepted";
import KeyValueCheck from "./KeyValueCheck";

const AcceptedIfNot = <
    T extends Record<string, unknown>
>(
    value: unknown,
    values: T,
    ...params: [keyof T, unknown][]
) => {
    if (KeyValueCheck(values, true, ...params)) return Accepted(value);
    return true;
}
export default AcceptedIfNot