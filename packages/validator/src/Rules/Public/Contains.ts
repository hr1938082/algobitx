import { PublicRuleDefinition } from "../../Meta";
import Array from "./Array";
import String from "./String";

const Contains: PublicRuleDefinition<(string | number)[]> = (value, ...params) => {
    if (String(value)) {
        return params.every(p => value.includes(p.toString()));
    }

    if (Array(value)) {
        return params.every(p => value.includes(p));
    }

    return false;
}

export default Contains;