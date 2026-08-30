import Declined from "../Public/Declined";
import Required from "../Public/Required";

const RequiredIfDeclined = <
    T extends Record<string, unknown>
>(
    value: unknown,
    values: T,
    ...params: (keyof T)[]
) => {
    for (const key of params) if (!Declined(values[key])) return true;
    return Required(value);
}

export default RequiredIfDeclined