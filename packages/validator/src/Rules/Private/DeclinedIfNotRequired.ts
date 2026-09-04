import Declined from "../Public/Declined";
import NotRequired from "../Public/NotRequired";

const DeclinedIfNotRequired = <
    T extends Record<string, unknown>
>(
    value: unknown,
    values: T,
    ...params: (keyof T)[]
) => {
    for (const key of params) if (!NotRequired(values[key])) return true;
    return Declined(value);
}


export default DeclinedIfNotRequired