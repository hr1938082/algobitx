import { PublicRuleDefinition } from "../../Meta";
import Regex from "./Regex";

const ContainsNumeric: PublicRuleDefinition = (value) => Regex(value, ".*[0-9].*");

export default ContainsNumeric;