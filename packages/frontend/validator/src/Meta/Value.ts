import { MetaRecord } from ".";
import DateAfter from "../Rules/Public/DateAfter";
import DateAfterOrEquals from "../Rules/Public/DateAfterOrEquals";
import DateBefore from "../Rules/Public/DateBefore";
import DateBeforeOrEquals from "../Rules/Public/DateBeforeOrEquals";
import DateEquals from "../Rules/Public/DateEquals";
import Max from "../Rules/Public/Max";
import Min from "../Rules/Public/Min";
import Regex from "../Rules/Public/Regex";

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