import { PublicRuleDefinition } from "../../Meta";
import Regex from "./Regex";

const ContainsUpperCase: PublicRuleDefinition = (value) => Regex(value, ".*[A-Z].*");

export default ContainsUpperCase;