import { PublicRuleDefinition } from "../../Meta";
import Regex from "./Regex";

const Email: PublicRuleDefinition = (value) =>
    Regex(value, "^[\\w.-]+@([\\w-]+\\.)+[\\w-]{2,}$");

export default Email;