import { Validate } from "../Meta";
import Regex from "./Regex";
import String from "./String";

const AlphaSymbol: Validate = (value: unknown): boolean =>
    Regex(value, "^[A-Za-z!@#\\$%\\^\\&*\\)\\(+=._-]+$");

export default AlphaSymbol;