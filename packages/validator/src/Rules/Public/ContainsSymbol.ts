import { PublicRuleDefinition } from "../../Meta";
import Regex from "./Regex";

const ContainsSymbol: PublicRuleDefinition = (value) => Regex(value, ".*[!-/:-@[-`{-~].*");

export default ContainsSymbol;