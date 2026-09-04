import Accepted from "../Public/Accepted";
import Required from "../Public/Required";

const RequiredIfAccepted = <
    T extends Record<string, unknown>
>(
    value: unknown,
    values: T,
    ...params: (keyof T)[]
) => {
    for (const key of params) if (!Accepted(values[key])) return true;
    return Required(value);
}

export default RequiredIfAccepted