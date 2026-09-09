import { Path } from "../..";
import ResolvePath from "../../ResolvePath";
import Required from "../Public/Required";

const RequiredIfRequired = <
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
            if (!Required(field.value)) return true;
        }
    }
    return Required(value);
}

export default RequiredIfRequired