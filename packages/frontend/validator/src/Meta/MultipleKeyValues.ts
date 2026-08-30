import AcceptedUnless from "../Rules/Private/AcceptedUnless";
import DeclinedUnless from "../Rules/Private/DeclinedUnless";
import RequiredUnless from "../Rules/Private/RequiredUnless";

export type MultipleKeyValuesRulesValue<T extends Record<string, unknown>> = [keyof T, unknown][] |
[keyof T, unknown];

const MultipleKeyValues = {
    accepted_unless: AcceptedUnless,
    declined_unless: DeclinedUnless,
    required_unless: RequiredUnless,
} as const;

export default MultipleKeyValues

