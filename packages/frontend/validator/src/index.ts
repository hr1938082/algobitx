import Basic from "./Keys/Basic";
import Key from "./Keys/Key";
import KeyValue from "./Keys/KeyValue";
import Value from "./Keys/Value";


type BasicRules = typeof Basic[number];
type ValuesRules = typeof Value[number];
type KeyRules = typeof Key[number];
type KeyValueRules = typeof KeyValue[number];

type Keys = BasicRules | ValuesRules | KeyRules | KeyValueRules;

type CommaSeparatedKeyValue<T> = `${Extract<keyof T, string>},value`;

type ValueRulesWithParams = `${ValuesRules}:value`;
type KeyRulesWithParam<T> = `${KeyRules}:${Extract<keyof T, string>}`;
type KeyValueRuleWithParams<T> = `${KeyValueRules}:${CommaSeparatedKeyValue<T>}`

type KeysWithParam<T> = BasicRules
    | ValueRulesWithParams
    | KeyRulesWithParam<T>
    | KeyValueRuleWithParams<T>
    | (`${string}` & {});


export type Rules<T> = {
    [k in keyof T]?: KeysWithParam<T>[]
}

type Message<T> = {
    [K in keyof T]?: {
        [Rule in Keys]?: string;
    };
};

type Error<T> = {
    [K in keyof T]?: any
}

export interface Options<T extends Record<string, any>> {
    values: T;
    rules?: Rules<T>;
    message?: Message<Rules<T>>;
}

class Validator {

}

export default Validator;