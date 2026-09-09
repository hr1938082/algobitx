import { Path } from "../..";
import ResolvePath from "../../ResolvePath";

const KeyValueCheck = <
    T extends object
>(
    values: T,
    not: boolean,
    ...params: [Path<T>, unknown][]
) => {
    for (const [key, valueMustBe] of params) {
        const resolveFields = ResolvePath(values, key);
        if (resolveFields.length === 0) {
            if (not) continue;
            return false;
        }
        for (const field of resolveFields) {
            if (not) { if (field.value === valueMustBe) return false; }
            else { if (field.value !== valueMustBe) return false; }
        }
    }
    return true;
}

export default KeyValueCheck