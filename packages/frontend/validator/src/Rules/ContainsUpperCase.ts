import { Validate } from "../Meta";
import Regex from "./Regex";

const ContainsUpperCase: Validate = (value: unknown): boolean => Regex(value, ".*[A-Z].*");

export default ContainsUpperCase;