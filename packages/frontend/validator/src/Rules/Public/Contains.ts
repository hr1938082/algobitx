import { PublicRuleDefinition } from "../../Meta";
import Array from "./Array";
import String from "./String";

const Contains: PublicRuleDefinition<(string | number)[]> = (value, ...params) =>
    (String(value) || Array(value)) && params.every(p => String(p) && value.includes(p));

export default Contains;