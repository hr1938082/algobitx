import Same from "../Rules/Private/Same";

export type KeyRuleValue<T extends Record<string, unknown>> = keyof T;

const Key = {
    same: Same,
} as const;

export default Key