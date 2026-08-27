import { Validate } from "../Meta";
import Date from "./Date";

const DateBeforeOrEquals: Validate = (value: unknown, param: unknown): boolean =>
    Date(value) && Date(param) &&
    new globalThis.Date(value).getTime()
    <= new globalThis.Date(param).getTime()

export default DateBeforeOrEquals;