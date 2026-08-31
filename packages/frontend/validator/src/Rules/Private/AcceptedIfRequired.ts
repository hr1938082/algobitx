import Accepted from "../Public/Accepted";
import Required from "../Public/Required";

const AcceptedIfRequired = <
    T extends Record<string, unknown>
>(
    value: unknown,
    values: T,
    ...params: (keyof T)[]
) => {
    for (const key of params) if (!Required(values[key])) return true;
    return Accepted(value);
}


export default AcceptedIfRequired