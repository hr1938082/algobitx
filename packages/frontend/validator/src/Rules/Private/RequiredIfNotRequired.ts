import NotRequired from "../Public/NotRequired";
import Required from "../Public/Required";

const RequiredIfNotRequired = <
    T extends Record<string, unknown>
>(
    value: unknown,
    values: T,
    ...params: (keyof T)[]
) => {
    for (const key of params) if (!NotRequired(values[key])) return true;
    return Required(value);
}

export default RequiredIfNotRequired