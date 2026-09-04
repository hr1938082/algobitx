import { PublicRuleDefinition } from "../../Meta";
import Array from "./Array";
import Numeric from "./Numeric";
import String from "./String";

const Between: PublicRuleDefinition<[number, number]> = (value, min, max) =>
    (Numeric(value) && value >= min && value <= max) ||
    ((String(value) || Array(value)) && value.length >= min && value.length <= max);

export default Between;