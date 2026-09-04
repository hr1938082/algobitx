import { PublicRuleDefinition } from "../../Meta";
import Numeric from "./Numeric";
import String from "./String";

const Date: PublicRuleDefinition = (value) => {
    if (!String(value) && !Numeric(value)) return false;
    const date = new globalThis.Date(value);
    return !Number.isNaN(date.getTime());
}

export default Date;