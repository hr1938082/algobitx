import DateAfter from "../Rules/Public/DateAfter";
import DateAfterOrEquals from "../Rules/Public/DateAfterOrEquals";
import DateBefore from "../Rules/Public/DateBefore";
import DateBeforeOrEquals from "../Rules/Public/DateBeforeOrEquals";
import DateEquals from "../Rules/Public/DateEquals";
import Max from "../Rules/Public/Max";
import Min from "../Rules/Public/Min";
import Regex from "../Rules/Public/Regex";

const Value = {
    min: Min,
    max: Max,
    regex: Regex,
    date_equals: DateEquals,
    date_before: DateBefore,
    date_before_or_equals: DateBeforeOrEquals,
    date_after: DateAfter,
    date_after_or_equals: DateAfterOrEquals,
} as const;

export default Value