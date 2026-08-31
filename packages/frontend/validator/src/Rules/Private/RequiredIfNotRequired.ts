import NotRequired from "../Public/NotRequired";

const RequiredIfNotRequired = <
    T extends Record<string, unknown>
>(
    value: unknown,
    values: T,
    ...params: (keyof T)[]
) => {
    for (const key of params) if (!NotRequired(values[key])) return true;
    return NotRequired(value);
}

export default RequiredIfNotRequired