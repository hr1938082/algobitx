import Meta, { AnyRules, PrivateMeta, PublicMeta } from "./Meta";
import Messages from "./Messages";
import PlainObject from "./Rules/Public/PlainObject";

export type Rules<T extends Record<string, unknown>> = {
    [k in keyof T]?: AnyRules<T>
}

type Message<T extends Record<string, unknown>> = {
    [K in keyof T]?: {
        [Rule in keyof typeof Meta]?: string;
    };
};

type ValidationError<T extends Record<string, unknown>> = {
    [K in keyof T]?: string[];
}

type Bail<T extends Record<string, unknown>> = {
    [K in keyof T]?: boolean;
}

export interface Options<T extends Record<string, unknown>> {
    values: T;
    rules: Rules<T>;
    messages?: Message<T>;
    bail?: boolean | Bail<T>
}

interface ValidationResult<T extends Record<string, unknown>> {
    failed: boolean;
    validated: Partial<T>;
    errors: ValidationError<T>;
}


class Validator<T extends Record<string, unknown>> {
    private _values: T;
    private rules: Rules<T>;
    private messages?: Message<T>;
    private bail: boolean | Bail<T>;
    private _failed = false;
    private _validated: Partial<T> = {};
    private _errors: ValidationError<T> = {};

    constructor(options: Options<T>) {
        if (!options.values || !PlainObject(options.values))
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

            const ruleObj = this.rules[key];

            if (!ruleObj) continue;

            for (const [ruleKey, ruleParams] of Object.entries(ruleObj)) {

                const ruleParamProcessed = ruleParams === true
                    ? []
                    : Array.isArray(ruleParams)
                        ? ruleParams
                        : [ruleParams]

                let res: boolean = false;

                if (ruleKey in PublicMeta) {
                    const meta = Meta[ruleKey as keyof typeof PublicMeta] as (
                        value: unknown,
                        ...params: unknown[]
                    ) => boolean;
                    res = meta(this._values[key], ...ruleParamProcessed);
                } else if (ruleKey in PrivateMeta) {
                    const meta = Meta[ruleKey as keyof typeof PrivateMeta] as (
                        value: unknown,
                        values: T,
                        ...params: unknown[]
                    ) => boolean;
                    res = meta(this._values[key], this._values, ...ruleParamProcessed);
                } else {
                    throw new Error(`Invalid Rule ${ruleKey}`);
                }

                if (!res) {
                    currentFails = true;
                    this._failed = true;
                    const msg = this.resolveMessage(String(key), ruleKey, ruleParamProcessed);

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
        if (!PlainObject(values))
            throw new Error("Expecting values for validation");
        this._values = values;
        this._failed = false;
        this._validated = {};
        this._errors = {};
        return this;
    }

    private resolveMessage(key: string, rule: string, params: unknown[]) {
        let message =
            this.messages?.[key]?.[rule as keyof typeof Meta] ??
            Messages[rule as keyof typeof Meta] ??
            `${key} is invalid`;

        const formatParam = (param: unknown): string => {
            if (Array.isArray(param)) {
                return param.map(formatParam).join(', ');
            }

            return String(param);
        };

        message = message.replaceAll(':key', key);

        message = message.replaceAll(':params', params.map(formatParam).join(', '));

        params.forEach((param, index) => {
            message = message.replaceAll(`:param${index}`, formatParam(param));
        });

        return message;
    }

    private get failed() {
        return this._failed;
    }

    private get validated() {
        return this._validated;
    }

    private get errors() {
        return this._errors;
    }

}

export default Validator;