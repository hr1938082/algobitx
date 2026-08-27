import { Validate } from "../../Meta";
import Regex from "./Regex";

const Ascii: Validate = (value: unknown): boolean => Regex(value, "^[\\x00-\\x7F]+$");

export default Ascii;