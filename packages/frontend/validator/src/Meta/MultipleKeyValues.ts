import AcceptedUnless from "../Rules/Private/AcceptedUnless";
import DeclinedUnless from "../Rules/Private/DeclinedUnless";
import RequiredUnless from "../Rules/Private/RequiredUnless";

export type MultipleKeyValuesRulesValue<T extends Record<string, unknown>> = [keyof T, unknown][] |
[keyof T, unknown];

const MultipleKeyValues = {
    required_if: '',
    required_if_not: RequiredUnless,
    accepted_if: '',
    accepted_if_not: AcceptedUnless,
    declined_if: '',
    declined_if_not: DeclinedUnless,
} as const;

export default MultipleKeyValues

