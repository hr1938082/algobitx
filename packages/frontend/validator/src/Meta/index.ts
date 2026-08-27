import Basic from "./Basic";
import Key from "./Key";
import KeyValue from "./KeyValue";
import MultipleValues from "./MultipleValues";
import TwoValues from "./TwoValues";
import Value from "./Value";

type ValidateType = 'internal' | 'public'

export type Validate = (value: unknown, ...params: unknown[]) => boolean
export type MetaRecord = Record<string, { validate: Validate, params: number, type: ValidateType }>;


const Meta = {
    ...Basic,
    ...Value,
    ...TwoValues,
    ...MultipleValues,
    ...Key,
    ...KeyValue,
} as const;

export default Meta;