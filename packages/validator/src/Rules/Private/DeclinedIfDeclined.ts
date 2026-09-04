import Declined from "../Public/Declined";

const DeclinedIfDeclined = <
    T extends Record<string, unknown>
>(
    value: unknown,
    values: T,
    ...params: (keyof T)[]
) => {
    for (const key of params) if (!Declined(values[key])) return true;
    return Declined(value);
}


export default DeclinedIfDeclined