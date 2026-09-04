import { PublicRuleDefinition } from "../../Meta";
import Date from "./Date";

const DateBefore: PublicRuleDefinition<[string | number]> = (value, param) =>
    Date(value) && Date(param) &&
    new globalThis.Date(value as any).getTime()
    < new globalThis.Date(param).getTime()

export default DateBefore;