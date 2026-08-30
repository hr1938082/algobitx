import { PublicRuleDefinition } from "../../Meta";
import Regex from "./Regex";

const Alpha: PublicRuleDefinition = (value) => Regex(value, "^[A-Za-z]+$")

export default Alpha