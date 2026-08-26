import { Validate } from "../Meta";
import String from "./String";

const Alpha: Validate = (value: unknown, params: string[]): boolean =>
    String(value, params) && new RegExp("^[A-Za-z]+$").test(value);

export default Alpha