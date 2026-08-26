import { Validate } from "../Meta";
import String from "./String";

const AlphaNumeric: Validate = (value: unknown): boolean =>
    String(value) && new RegExp("^[A-Za-z0-9]+$").test(value);

export default AlphaNumeric