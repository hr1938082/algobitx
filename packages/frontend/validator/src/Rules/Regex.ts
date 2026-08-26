import { Validate } from "../Meta";
import String from "./String";

const Regex: Validate = (value: unknown, pattern: string): boolean =>
    String(value) && new RegExp(pattern).test(value)

export default Regex