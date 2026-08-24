import { RuleKeyPairsType } from ".";

const Basic: RuleKeyPairsType = {
    accepted: (key: string, value: unknown) => true,
    alpha: (key: string, value: unknown) => true,
    alpha_numeric: (key: string, value: unknown) => true,
    alpha_symbols: (key: string, value: unknown) => true,
    alpha_numeric_symbols: (key: string, value: unknown) => true,
    array: (key: string, value: unknown) => true,
    ascii: (key: string, value: unknown) => true,
    boolean: (key: string, value: unknown) => true,
    declined: (key: string, value: unknown) => true,
    required: (key: string, value: unknown) => true,
    date: (key: string, value: unknown) => true,
    email: (key: string, value: unknown) => true,
    upper_case: (key: string, value: unknown) => true,
    must_contains_upper_case: (key: string, value: unknown) => true,
    small_case: (key: string, value: unknown) => true,
    must_contains_small_case: (key: string, value: unknown) => true,
    numeric: (key: string, value: unknown) => true,
    must_contains_numeric: (key: string, value: unknown) => true,
    symbols: (key: string, value: unknown) => true,
    must_contains_symbols: (key: string, value: unknown) => true,
} as const;

export default Basic

