import { Validate } from "../Meta";
import String from "./String";

const AlphaNumericSymbol: Validate = (value: unknown, params: string[]): boolean =>
    String(value, params) &&
    new RegExp("^[A-Za-z0-9!@#\\$%\\^\\&*\\)\\(+=._-]+$").test(value);

export default AlphaNumericSymbol