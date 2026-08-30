import Accepted from "../Public/Accepted";
import KeyValueCheck from "./KeyValueCheck";

const AcceptedUnless = <
    T extends Record<string, unknown>
>(
    value: unknown,
    values: T,
    ...params: [keyof T, unknown][]
) => {
    if (KeyValueCheck(values, ...params)) return !Accepted(value);
    return true;
}
export default AcceptedUnless