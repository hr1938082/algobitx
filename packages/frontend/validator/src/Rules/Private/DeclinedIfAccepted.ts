import Accepted from "../Public/Accepted";
import Declined from "../Public/Declined";

const DeclinedIfAccepted = <
    T extends Record<string, unknown>
>(
    value: unknown,
    values: T,
    ...params: (keyof T)[]
) => {
    for (const key of params) if (!Accepted(values[key])) return true;
    return Declined(value);
}


export default DeclinedIfAccepted