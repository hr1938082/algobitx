import { MetaRecord } from ".";
import Min from "../Rules/Min";
import Regex from "../Rules/Regex";

const Value = {
    min: { validate: Min, params: 1 },
    max: { validate: (value: unknown) => true, params: 1 },
    regex: { validate: Regex, params: 1 },
    date_equals_to: { validate: (value: unknown) => true, params: 1 },
    date_greater_than: { validate: (value: unknown) => true, params: 1 },
    date_greater_than_equals_to: { validate: (value: unknown) => true, params: 1 },
    date_less_than: { validate: (value: unknown) => true, params: 1 },
    date_less_than_equals_to: { validate: (value: unknown) => true, params: 1 },
} as const satisfies MetaRecord;

export default Value