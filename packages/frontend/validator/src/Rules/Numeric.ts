import { Validate } from "../Meta";
import Regex from "./Regex";

const Numeric: Validate = (value: unknown): boolean =>
    typeof value === 'number' || Regex(value, "^[0-9]+$");

export default Numeric;