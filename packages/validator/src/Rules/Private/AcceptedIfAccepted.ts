import { Path } from "../..";
import ResolvePath from "../../ResolvePath";
import Accepted from "../Public/Accepted";

const AcceptedIfAccepted = <
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
            if (!Accepted(field.value)) return false;
        }
    }
    return Accepted(value);
}


export default AcceptedIfAccepted