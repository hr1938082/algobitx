import Required from "../Public/Required";

const RequiredIfRequired = <
    T extends Record<string, unknown>
>(
    value: unknown,
    values: T,
    ...params: (keyof T)[]
) => {
    for (const key of params) if (!Required(values[key])) return true;
    return Required(value);
}

export default RequiredIfRequired