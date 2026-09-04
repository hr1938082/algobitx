import { PublicRuleDefinition } from "../../Meta";
import Regex from "./Regex";

const AlphaNumericSymbol: PublicRuleDefinition = (value) =>
    Regex(value, "^[A-Za-z0-9!@#\\$%\\^\\&*\\)\\(+=._-]+$");

export default AlphaNumericSymbol