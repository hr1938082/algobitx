import { Validate } from "../../Meta";
import Regex from "./Regex";

const Email: Validate = (value: unknown): boolean =>
    Regex(value, "^[\\w\\-.]+@([\\w\\-]+\\.)+[\\w\\-]{2,4}$");

export default Email;