import { Validate } from "../Meta";
import Regex from "./Regex";
import String from "./String";

const AlphaNumericSymbol: Validate = (value: unknown): boolean =>
    Regex(value, "^[A-Za-z0-9!@#\\$%\\^\\&*\\)\\(+=._-]+$");

export default AlphaNumericSymbol