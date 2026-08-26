import { Validate } from "../Meta";
import Regex from "./Regex";

const AlphaNumericSymbol: Validate = (value: unknown): boolean =>
    Regex(value, "^[A-Za-z0-9!@#\\$%\\^\\&*\\)\\(+=._-]+$");

export default AlphaNumericSymbol