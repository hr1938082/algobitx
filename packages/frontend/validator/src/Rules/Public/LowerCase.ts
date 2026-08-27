import { Validate } from "../../Meta";
import Regex from "./Regex";

const LowerCase: Validate = (value: unknown): boolean => Regex(value, "^[a-z]+$");

export default LowerCase;