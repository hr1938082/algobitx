import { PublicRuleDefinition } from "../../Meta";
import Regex from "./Regex";

const Symbols: PublicRuleDefinition = (value) => Regex(value, "^[!-/:-@[-`{-~]+$");

export default Symbols;