import { PublicRuleDefinition } from "../../Meta";
import Regex from "./Regex";

const AlphaSymbol: PublicRuleDefinition = (value) =>
    Regex(value, "^[A-Za-z!@#\\$%\\^\\&*\\)\\(+=._-]+$");

export default AlphaSymbol;