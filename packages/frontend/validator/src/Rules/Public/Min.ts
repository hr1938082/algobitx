import { PublicRuleDefinition } from "../../Meta";
import Array from "./Array";
import Numeric from "./Numeric";
import String from "./String";

const Min: PublicRuleDefinition<[number]> = (value, param) =>
    (Numeric(value) && value >= param) ||
    ((String(value) || Array(value)) && value.length >= param);

export default Min;