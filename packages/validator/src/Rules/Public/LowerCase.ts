import { PublicRuleDefinition } from "../../Meta";
import Regex from "./Regex";

const LowerCase: PublicRuleDefinition = (value) => Regex(value, "^[a-z]+$");

export default LowerCase;