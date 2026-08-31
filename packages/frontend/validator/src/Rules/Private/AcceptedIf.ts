import Accepted from "../Public/Accepted";
import KeyValueCheck from "./KeyValueCheck";

const AcceptedIf = <
    T extends Record<string, unknown>
>(
    value: unknown,
    values: T,
    ...params: [keyof T, unknown][]
) => {
    if (KeyValueCheck(values, false, ...params)) return Accepted(value);
    return true;
}
export default AcceptedIf