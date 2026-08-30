const Same = <
    T extends Record<string, unknown>
>(
    value: unknown,
    values: T,
    param: keyof T
) => value === values[param]

export default Same