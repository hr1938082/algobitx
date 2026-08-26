import { Validate } from "../Meta";
import Regex from "./Regex";

const ContainsSymbol: Validate = (value: unknown): boolean => Regex(value, ".*[!-/:-@[-`{-~].*");

export default ContainsSymbol;