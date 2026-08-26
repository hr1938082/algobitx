import { Validate } from "../Meta";
import String from "./String";

const AlphaSymbol: Validate = (value: unknown, params: string[]): boolean =>
    String(value, params) &&
    new RegExp("^[A-Za-z!@#\\$%\\^\\&*\\)\\(+=._-]+$").test(value);

export default AlphaSymbol;