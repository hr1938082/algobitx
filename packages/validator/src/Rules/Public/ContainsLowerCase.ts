import { PublicRuleDefinition } from "../../Meta";
import Regex from "./Regex";

const ContainsLowerCase: PublicRuleDefinition = (value) => Regex(value, ".*[a-z].*");

export default ContainsLowerCase;