import { PublicRuleDefinition } from "../../Meta";
import Array from "./Array";
import Numeric from "./Numeric";
import String from "./String";

const Max: PublicRuleDefinition<[number]> = (value, param): boolean =>
    (Numeric(value) && value <= param) ||
    ((String(value) || Array(value)) && value.length <= param);

export default Max;