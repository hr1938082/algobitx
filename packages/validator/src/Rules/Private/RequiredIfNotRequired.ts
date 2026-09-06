import { Path } from "../..";
import ResolvePath from "../../ResolvePath";
import NotRequired from "../Public/NotRequired";
import Required from "../Public/Required";

const RequiredIfNotRequired = <
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
            if (!NotRequired(field.value)) return true;
        }
    }
    return Required(value);
}

export default RequiredIfNotRequired