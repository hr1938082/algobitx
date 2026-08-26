import { Validate } from "../Meta";
import Regex from "./Regex";

const Alpha: Validate = (value: unknown): boolean => Regex(value, "^[A-Za-z]+$")

export default Alpha