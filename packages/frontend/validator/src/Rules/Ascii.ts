import { Validate } from "../Meta";
import Regex from "./Regex";
import String from "./String";

const Ascii: Validate = (value: unknown): boolean => Regex(value, "^[\\x00-\\x7F]+$");

export default Ascii;