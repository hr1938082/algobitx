import { RuleKeyPairsType } from ".";

const KeyValue: RuleKeyPairsType = {
    accepted_unless: (key: string, value: unknown) => true,
    declined_unless: (key: string, value: unknown) => true,
    required_unless: (key: string, value: unknown) => true,
} as const;

export default KeyValue

