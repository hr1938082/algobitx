import { PublicRuleDefinition } from "../../Meta";
import Regex from "./Regex";

const Ascii: PublicRuleDefinition = (value) => Regex(value, "^[\\x00-\\x7F]+$");

export default Ascii;