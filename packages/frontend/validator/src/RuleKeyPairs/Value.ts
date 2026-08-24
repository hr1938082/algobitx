import { RuleKeyPairsType } from ".";

const Value: RuleKeyPairsType = {
    between: (key: string, value: unknown) => true,
    contains: (key: string, value: unknown) => true,
    min: (key: string, value: unknown) => true,
    max: (key: string, value: unknown) => true,
    regex: (key: string, value: unknown) => true,
    date_equals_to: (key: string, value: unknown) => true,
    date_greater_than: (key: string, value: unknown) => true,
    date_greater_than_equals_to: (key: string, value: unknown) => true,
    date_less_than: (key: string, value: unknown) => true,
    date_less_than_equals_to: (key: string, value: unknown) => true,
} as const;

export default Value