import { Validate } from "../Meta";
import String from "./String";

const AlphaNumeric: Validate = (value: unknown, params: string[]): boolean =>
    String(value, params) && new RegExp("^[A-Za-z0-9]+$").test(value);

export default AlphaNumeric