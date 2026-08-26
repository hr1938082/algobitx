import BasicRules from "./Basic";
import KeyRules from "./Key";
import KeyValueRules from "./KeyValue";
import MultipleValues from "./MultipleValues";
import TwoValues from "./TwoValues";
import ValueRules from "./Value";

export type Validate = (value: unknown, ...params: string[]) => boolean
export type MetaRecord = Record<string, { validate: Validate, params: number }>;

const Meta = {
    basic: BasicRules,
    value: ValueRules,
    two_values: TwoValues,
    multipe_values: MultipleValues,
    key: KeyRules,
    key_value: KeyValueRules,
}

const MetaCollection = {
    ...Meta.basic,
    ...Meta.value,
    ...Meta.two_values,
    ...Meta.multipe_values,
    ...Meta.key,
    ...Meta.key_value,
} as const;

export { MetaCollection }

export default Meta;