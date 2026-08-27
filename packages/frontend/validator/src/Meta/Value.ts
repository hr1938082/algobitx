import { MetaRecord } from ".";
import DateAfter from "../Rules/DateAfter";
import DateAfterOrEquals from "../Rules/DateAfterOrEquals";
import DateBefore from "../Rules/DateBefore";
import DateBeforeOrEquals from "../Rules/DateBeforeOrEquals";
import DateEquals from "../Rules/DateEquals";
import Max from "../Rules/Max";
import Min from "../Rules/Min";
import Regex from "../Rules/Regex";

const Value = {
    min: { validate: Min, params: 1, type: 'public' },
    max: { validate: Max, params: 1, type: 'public' },
    regex: { validate: Regex, params: 1, type: 'public' },
    date_equals: { validate: DateEquals, params: 1, type: 'public' },
    date_before: { validate: DateBefore, params: 1, type: 'public' },
    date_before_or_equals: { validate: DateBeforeOrEquals, params: 1, type: 'public' },
    date_after: { validate: DateAfter, params: 1, type: 'public' },
    date_after_or_equals: { validate: DateAfterOrEquals, params: 1, type: 'public', },
} as const satisfies MetaRecord;

export default Value