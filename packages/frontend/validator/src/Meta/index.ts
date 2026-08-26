import BasicRules from "./Basic";
import KeyRules from "./Key";
import KeyValueRules from "./KeyValue";
import TwoValues from "./TwoValues";
import ValueRules from "./Value";

export type Validate = (value: unknown, params: string[]) => boolean
export type MetaRecord = Record<string, { validate: Validate, params: number }>;

const Meta = {
    basic: BasicRules,
    value: ValueRules,
    two_values: TwoValues,
    key: KeyRules,
    key_value: KeyValueRules,
}

export default Meta;