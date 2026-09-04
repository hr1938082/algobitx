import { PublicRuleDefinition } from "../../Meta";
import String from "./String";

const Regex: PublicRuleDefinition<[string]> = (value, pattern) =>
    String(value) && new RegExp(pattern).test(value)

export default Regex