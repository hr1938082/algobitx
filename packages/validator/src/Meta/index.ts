import Basic from "./Basic";
import MultipleKeys, { MultipleKeyRuleValue } from "./MultipleKeys";
import MultipleKeyValues, { MultipleKeyValuesRulesValue } from "./MultipleKeyValues";
import MultipleValues from "./MultipleValues";
import TwoValues from "./TwoValues";
import Value from "./Value";

export type PublicRuleDefinition<
    TParams extends readonly unknown[] = []
> = (value: unknown, ...params: TParams) => boolean;

type PublicRuleParams<T> =
    T extends (...args: infer P) => boolean
    ? P extends [unknown, ...infer R]
    ? R
    : never
    : never;

type PublicRuleValue<T> =
    PublicRuleParams<T> extends []
    ? true
    : PublicRuleParams<T> extends [infer P]
    ? P
    : PublicRuleParams<T>;


type PublicRules = {
    [K in keyof typeof PublicMeta]?: PublicRuleValue<typeof PublicMeta[K]>;
}

type MultipleKeysRules<T extends object> = {
    [K in keyof typeof MultipleKeys]?: MultipleKeyRuleValue<T>;
}

type MultipleKeyValuesRules<T extends object> = {
    [K in keyof typeof MultipleKeyValues]?: MultipleKeyValuesRulesValue<T>;
}

type PrivateRules<T extends object> = MultipleKeysRules<T> &
    MultipleKeyValuesRules<T>

export type AnyRules<T extends object> = PublicRules & PrivateRules<T>;

export const PublicMeta = {
    ...Basic,
    ...Value,
    ...TwoValues,
    ...MultipleValues,
}

export const PrivateMeta = {
    ...MultipleKeys,
    ...MultipleKeyValues,
}

const Meta = {
    ...PublicMeta,
    ...PrivateMeta
} as const;

export default Meta;