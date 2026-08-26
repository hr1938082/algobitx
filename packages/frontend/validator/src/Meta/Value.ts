import { MetaRecord } from ".";
import DateBefore from "../Rules/DateBefore";
import DateEquals from "../Rules/DateEquals";
import Max from "../Rules/Max";
import Min from "../Rules/Min";
import Regex from "../Rules/Regex";

const Value = {
    min: { validate: Min, params: 1 },
    max: { validate: Max, params: 1 },
    regex: { validate: Regex, params: 1 },
    date_equals: { validate: DateEquals, params: 1 },
    date_before: { validate: DateBefore, params: 1 },
    date_before_or_equals: { validate: (value: unknown) => true, params: 1 },
    date_after: { validate: (value: unknown) => true, params: 1 },
    date_after_or_equals: { validate: (value: unknown) => true, params: 1 },
} as const satisfies MetaRecord;

export default Value