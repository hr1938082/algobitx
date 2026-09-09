import { Path } from "../..";
import Required from "../Public/Required";
import KeyValueCheck from "./KeyValueCheck";

const RequiredIf = <
    T extends object
>(
    value: unknown,
    values: T,
    ...params: [Path<T>, unknown] | [Path<T>, unknown][]
) => {
    const newParams = (
        Array.isArray(params[0])
            ? params
            : [params]
    ) as [Path<T>, unknown][];
    if (KeyValueCheck(values, false, ...newParams)) return Required(value);
    return true;
}

export default RequiredIf