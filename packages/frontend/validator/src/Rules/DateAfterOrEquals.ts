import { Validate } from "../Meta";
import Date from "./Date";

const DateAfterOrEquals: Validate = (value: unknown, param: string): boolean =>
    Date(value) && Date(param) &&
    new globalThis.Date(value).getTime()
    >= new globalThis.Date(param).getTime()

export default DateAfterOrEquals;