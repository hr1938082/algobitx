import Accepted from "../Public/Accepted";
import NotRequired from "../Public/NotRequired";

const AcceptedIfNotRequired = <
    T extends Record<string, unknown>
>(
    value: unknown,
    values: T,
    ...params: (keyof T)[]
) => {
    for (const key of params) if (!NotRequired(values[key])) return true;
    return Accepted(value);
}

export default AcceptedIfNotRequired