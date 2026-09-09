import { PublicRuleDefinition } from "../../Meta";
import Array from "./Array";
import Numeric from "./Numeric";
import String from "./String";

const Enum: PublicRuleDefinition<(string | number)[]> = (value, ...params) => {
    if (String(value) || Numeric(value))
        return params.some(p => p === value);

    if (Array(value))
        return value.every(v =>
            (String(v) || Numeric(v)) &&
            params.includes(v)
        );

    return false;
}

export default Enum;