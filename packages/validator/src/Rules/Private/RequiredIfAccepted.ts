import { Path } from "../..";
import ResolvePath from "../../ResolvePath";
import Accepted from "../Public/Accepted";
import Required from "../Public/Required";

const RequiredIfAccepted = <
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
    return Required(value);
}

export default RequiredIfAccepted