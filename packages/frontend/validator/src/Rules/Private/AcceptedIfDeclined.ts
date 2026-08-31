import Accepted from "../Public/Accepted";
import Declined from "../Public/Declined";

const AcceptedIfDeclined = <
    T extends Record<string, unknown>
>(
    value: unknown,
    values: T,
    ...params: (keyof T)[]
) => {
    for (const key of params) if (!Declined(values[key])) return true;
    return Accepted(value);
}


export default AcceptedIfDeclined