import { RuleKeyPairsType } from ".";

const Key: RuleKeyPairsType = {
    accepted_if: (key: string, value: unknown) => true,
    declined_if: (key: string, value: unknown) => true,
    required_if: (key: string, value: unknown) => true,
    required_if_accepted: (key: string, value: unknown) => true,
    required_if_any: (key: string, value: unknown) => true,
    required_if_declined: (key: string, value: unknown) => true,
    required_if_not: (key: string, value: unknown) => true,
    required_if_not_any: (key: string, value: unknown) => true,
    same: (key: string, value: unknown) => true,
} as const;

export default Key