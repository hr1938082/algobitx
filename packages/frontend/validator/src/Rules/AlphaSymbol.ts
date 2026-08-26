import { Validate } from "../Meta";
import String from "./String";

const AlphaSymbol: Validate = (value: unknown): boolean =>
    String(value) &&
    new RegExp("^[A-Za-z!@#\\$%\\^\\&*\\)\\(+=._-]+$").test(value);

export default AlphaSymbol;