import { PublicRuleDefinition } from "../../Meta";
import Regex from "./Regex";

const UpperCase: PublicRuleDefinition = (value) => Regex(value, "^[A-Z]+$");

export default UpperCase;