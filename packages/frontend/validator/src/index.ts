
import RuleKeyPairs from "./RuleKeyPairs";

type BasicRules = typeof RuleKeyPairs.basic[number];
type ValuesRules = typeof RuleKeyPairs.value[number];
type KeyRules = typeof RuleKeyPairs.key[number];
type KeyValueRules = typeof RuleKeyPairs.key_value[number];

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
    [k in keyof T]: KeysWithParam<T>[]
}

type Message<T> = {
    [K in keyof T]: {
        [Rule in Keys]?: string;
    };
};

type Error<T> = {
    [K in keyof T]: string | string[]
}

export interface Options<T extends Record<string, any>> {
    values: T;
    rules: Rules<T>;
    message?: Message<Rules<T>>;
}

class Validator<T extends Record<string, any>> {

    private values: T;
    private rules: Rules<T>;
    private messges?: Message<T>
    private fails = true;
    private validated: Partial<T> = {};
    private errors: Partial<Error<T>> = {};

    constructor(options: Options<T>) {
        if (!options.values && Object.keys(options.values))
            throw new Error("Expecting values for validation");
        if (!options.rules && Object.keys(options.rules))
            throw new Error("Expecting rules defination for validation");

        this.values = options.values;
        this.rules = options.rules;
        this.messges = options.message;
    }

    validate() {
        for (const [key, ruleArr] of Object.entries(this.rules)) {
            for (const rule of ruleArr) {
                const ruleKeyValue = rule.split(':');
                if (ruleKeyValue.length === 0) throw new Error(`Invalid Rule ${rule}`);

                const ruleKey = ruleKeyValue[0];
                const ruleParam = ruleKeyValue[1]?.split(',') ?? [];

            }
        }
    }

}

export default Validator;