import { Path } from "../.."
import ResolvePath from "../../ResolvePath";

const Same = <
    T extends Record<string, unknown>
>(
    value: unknown,
    values: T,
    ...param: Path<T>[]
) => {
    for (const key of param) {
        const resolveFields = ResolvePath(values, key);
        if (resolveFields.length === 0) return false;
        for (const field of resolveFields) {
            if (field.value !== value) return false;
        }
    }
    return true;
}

export default Same