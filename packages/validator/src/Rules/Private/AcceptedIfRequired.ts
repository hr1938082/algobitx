import { Path } from "../..";
import ResolvePath from "../../ResolvePath";
import Accepted from "../Public/Accepted";
import Required from "../Public/Required";

const AcceptedIfRequired = <
    T extends Record<string, unknown>
>(
    value: unknown,
    values: T,
    ...params: Path<T>[]
) => {
    for (const key of params) {
        const resolveFields = ResolvePath(values, key);
        if (resolveFields.length === 0) return false;
        for (const field of resolveFields) {
            if (!Required(field.value)) return true;
        }
    }
    return Accepted(value);
}


export default AcceptedIfRequired