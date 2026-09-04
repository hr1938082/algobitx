import Accepted from "../Public/Accepted";

const AcceptedIfAccepted = <
    T extends Record<string, unknown>
>(
    value: unknown,
    values: T,
    ...params: (keyof T)[]
) => {
    for (const key of params) if (!Accepted(values[key])) return true;
    return Accepted(value);
}


export default AcceptedIfAccepted