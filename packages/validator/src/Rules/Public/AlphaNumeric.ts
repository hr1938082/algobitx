import { PublicRuleDefinition } from "../../Meta";
import Regex from "./Regex";

const AlphaNumeric: PublicRuleDefinition = (value) => Regex(value, "^[A-Za-z0-9]+$")

export default AlphaNumeric