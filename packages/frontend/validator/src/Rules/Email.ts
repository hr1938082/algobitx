import { Validate } from "../Meta";
import String from "./String";

const Email: Validate = (value: unknown): boolean =>
    String(value) &&
    new RegExp("^[\\w\\-.]+@([\\w\\-]+\\.)+[\\w\\-]{2,4}$").test(value);

export default Email;