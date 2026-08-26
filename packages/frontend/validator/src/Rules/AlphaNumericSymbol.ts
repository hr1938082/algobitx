import { Validate } from "../Meta";
import String from "./String";

const AlphaNumericSymbol: Validate = (value: unknown): boolean =>
    String(value) &&
    new RegExp("^[A-Za-z0-9!@#\\$%\\^\\&*\\)\\(+=._-]+$").test(value);

export default AlphaNumericSymbol