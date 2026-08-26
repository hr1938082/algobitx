import { Validate } from "../Meta";
import Regex from "./Regex";

const AlphaSymbol: Validate = (value: unknown): boolean =>
    Regex(value, "^[A-Za-z!@#\\$%\\^\\&*\\)\\(+=._-]+$");

export default AlphaSymbol;