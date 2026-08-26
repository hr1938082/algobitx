import Meta from "./Meta";
import Messages from "./Messages";

type BasicRules = keyof typeof Meta.basic;
type ValuesRules = keyof typeof Meta.value;
type TwoValuesRules = keyof typeof Meta.two_values;
type KeyRules = keyof typeof Meta.key;
type KeyValueRules = keyof typeof Meta.key_value;

export type Keys = BasicRules | ValuesRules | TwoValuesRules | KeyRules | KeyValueRules;

type CommaSeparatedKeyValue<T> = `${Extract<keyof T, string>},value`;

type ValueRulesWithParams = `${ValuesRules}:value`;
type TwoValuesRulesWithParams = `${TwoValuesRules}:value,value`;
type KeyRulesWithParam<T> = `${KeyRules}:${Extract<keyof T, string>}`;
type KeyValueRuleWithParams<T> = `${KeyValueRules}:${CommaSeparatedKeyValue<T>}`

type KeysWithParam<T> = BasicRules
    | ValueRulesWithParams
    | TwoValuesRulesWithParams
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

type ValidationError<T> = {
    [K in keyof T]?: string[];
}

type Bail<T> = {
    [K in keyof T]?: boolean;
}

export interface Options<T extends Record<string, unknown>> {
    values: T;
    rules: Rules<T>;
    messages?: Message<T>;
    bail?: boolean | Bail<T>
}

interface ValidationResult<T> {
    failed: boolean;
    validated: Partial<T>;
    errors: ValidationError<T>;
}

const metaCollection = {
    ...Meta.basic,
    ...Meta.key,
    ...Meta.key_value,
    ...Meta.value
} as const;


class Validator<T extends Record<string, unknown>> {
    private _values: T;
    private rules: Rules<T>;
    private messages?: Message<T>
    private bail: boolean | Bail<T>;
    private _failed = false;
    private _validated: Partial<T> = {};
    private _errors: ValidationError<T> = {};

    constructor(options: Options<T>) {
        if (!options.values ||
            typeof options.values !== 'object' ||
            Array.isArray(options.values)
        )
            throw new Error("Expecting values for validation");
        if (!options.rules || Object.keys(options.rules).length === 0)
            throw new Error("Expecting rules defination for validation");

        this._values = options.values;
        this.rules = options.rules;
        this.messages = options.messages;
        this.bail = options.bail ?? true;

    }

    static define<T extends Record<string, unknown>>(
        options: Options<T>
    ) {
        return new Validator(options);
    }

    validate(...fields: Extract<keyof T, string>[]): ValidationResult<T> {
        this._failed = false;
        this._validated = {};
        this._errors = {};

        for (const key of Object.keys(this.rules) as (keyof T)[]) {
            if (fields.length > 0 && !fields.some(field => field === key))
                continue;

            let currentFails = false;

            const shouldBail = typeof this.bail === 'boolean'
                ? this.bail
                : this.bail[key] ?? true;

            const ruleArr = this.rules[key];

            if (!ruleArr) continue;

            for (const rule of ruleArr) {
                const separator = rule.indexOf(':');

                const ruleKey = separator === -1
                    ? rule
                    : rule.slice(0, separator);

                const error = new Error(`Invalid Rule ${rule}`);
                if (!ruleKey || !(ruleKey in metaCollection)) throw error;

                const ruleParams = separator === -1
                    ? []
                    : rule.slice(separator + 1).split(',');

                const meta = metaCollection[ruleKey as keyof typeof metaCollection];
                if (!meta || meta.params !== ruleParams.length) throw error;

                const res = meta.validate(this._values[key], ruleParams);

                if (!res) {
                    currentFails = true;
                    this._failed = true;
                    const msg = this.resolveMessage(String(key), ruleKey, ruleParams);

                    let errMsg = this._errors[key];
                    if (errMsg) {
                        errMsg.push(msg);
                    } else {
                        this._errors[key] = [msg];
                    }

                    if (shouldBail) break;
                }
            }

            if (!currentFails)
                this._validated[key] = this._values[key]
        }

        return {
            failed: this.failed,
            validated: this.validated,
            errors: this.errors
        }
    }

    update(values: T) {
        this._values = values;
        return this;
    }

    private resolveMessage(key: string, rule: string, params: string[]) {
        let message =
            this.messages?.[key]?.[rule as Keys] ??
            Messages[rule as Keys] ??
            `${key} is invalid`;

        message = message.replaceAll(':key', key);

        message = message.replaceAll(':params', params.join(', '));

        params.forEach((param, index) => {
            message = message.replaceAll(`:param${index}`, param);
        });

        return message;
    }

    private get failed() {
        return this._failed;
    }

    private get validated() {
        return structuredClone(this._validated);
    }

    private get errors() {
        return structuredClone(this._errors);
    }

}

export default Validator;


Validator.define({
    values: {
        test: '124'
    },
    rules: {
        test: ['required', 'between:1,2']
    }
})