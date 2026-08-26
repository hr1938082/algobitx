import { Validate } from "../Meta";
import Regex from "./Regex";

const Numeric = (value: unknown): value is number =>
    typeof value === 'number' || Regex(value, "^[0-9]+$");

export default Numeric;