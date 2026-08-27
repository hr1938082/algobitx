import { Validate } from "../../Meta";
import Regex from "./Regex";

const AlphaNumeric: Validate = (value: unknown): boolean => Regex(value, "^[A-Za-z0-9]+$")

export default AlphaNumeric