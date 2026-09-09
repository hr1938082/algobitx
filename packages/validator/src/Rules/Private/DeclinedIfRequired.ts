import { Path } from "../..";
import ResolvePath from "../../ResolvePath";
import Declined from "../Public/Declined";
import Required from "../Public/Required";

const DeclinedIfRequired = <
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
    return Declined(value);
}


export default DeclinedIfRequired