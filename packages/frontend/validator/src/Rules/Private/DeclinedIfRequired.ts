import Declined from "../Public/Declined";
import Required from "../Public/Required";

const DeclinedIfRequired = <
    T extends Record<string, unknown>
>(
    value: unknown,
    values: T,
    ...params: (keyof T)[]
) => {
    for (const key of params) if (!Required(values[key])) return true;
    return Declined(value);
}


export default DeclinedIfRequired