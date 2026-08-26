import { Validate } from "../Meta";
import Regex from "./Regex";

const Symbols: Validate = (value: unknown): boolean => Regex(value, "^[!-/:-@[-`{-~]+$");

export default Symbols;