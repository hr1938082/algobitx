import { Path } from "../..";
import ResolvePath from "../../ResolvePath";
import Accepted from "../Public/Accepted";
import Declined from "../Public/Declined";

const DeclinedIfAccepted = <
    T extends object
>(
    value: unknown,
    values: T,
    ...params: Path<T>[]
) => {
    for (const key of params) {
        const resolveFields = ResolvePath(values, key);
        if (resolveFields.length === 0) return false;
        for (const field of resolveFields) {
            if (!Accepted(field.value)) return true;
        }
    }
    return Declined(value);
}


export default DeclinedIfAccepted