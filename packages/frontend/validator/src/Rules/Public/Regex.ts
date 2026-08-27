import { Validate } from "../../Meta";
import String from "./String";

const Regex: Validate = (value: unknown, pattern: unknown): boolean =>
    String(value) && String(pattern) && new RegExp(pattern).test(value)

export default Regex