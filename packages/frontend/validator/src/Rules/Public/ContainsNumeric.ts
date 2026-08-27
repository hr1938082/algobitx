import { Validate } from "../../Meta";
import Regex from "./Regex";

const ContainsNumeric: Validate = (value: unknown): boolean => Regex(value, ".*[0-9].*");

export default ContainsNumeric;