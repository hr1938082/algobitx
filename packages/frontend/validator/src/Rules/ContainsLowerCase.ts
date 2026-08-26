import { Validate } from "../Meta";
import Regex from "./Regex";

const ContainsLowerCase: Validate = (value: unknown): boolean => Regex(value, ".*[a-z].*");

export default ContainsLowerCase;