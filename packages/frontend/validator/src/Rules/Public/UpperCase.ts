import { Validate } from "../../Meta";
import Regex from "./Regex";

const UpperCase: Validate = (value: unknown): boolean => Regex(value, "^[A-Z]+$");

export default UpperCase;