import { PublicRuleDefinition } from "../../Meta";
import Array from "./Array";
import Numeric from "./Numeric";

const Max: PublicRuleDefinition<[number]> = (value, param): boolean => {
    if (Numeric(value) && value <= param) return true;
    if (Array(value) && value.length <= param) return true;
    return false;
}

export default Max;