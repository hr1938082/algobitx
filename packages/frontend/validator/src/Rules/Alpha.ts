import { Validate } from "../Meta";
import String from "./String";

const Alpha: Validate = (value: unknown): boolean =>
    String(value) && new RegExp("^[A-Za-z]+$").test(value);

export default Alpha