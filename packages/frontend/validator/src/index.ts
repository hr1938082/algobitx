import Meta, { AnyRules, PrivateMeta, PublicMeta } from "./Meta";
import Messages from "./Messages";
import PlainObject from "./Rules/Public/PlainObject";

type PathValue<T> =
    T extends readonly unknown[]
    ? `${number}`
    | "*"
    | `${number}.${PathValue<T[number]>}`
    | `*.${PathValue<T[number]>}`
    : T extends object
    ? {
        [K in keyof T & string]:
        T[K] extends readonly unknown[] | object
        ? K | `${K}.${PathValue<T[K]>}`
        : K
    }[keyof T & string]
    : never;

export type Path<T> = PathValue<T>;

export type Rules<T extends Record<string, unknown>> = {
    [k in Path<T>]?: AnyRules<T>
}

type Message<T extends Record<string, unknown>> = {
    [K in Path<T>]?: {
        [Rule in keyof typeof Meta]?: string;
    };
};

type ValidationError<T extends Record<string, unknown>> = {
    [K in Path<T>]?: string[];
}

type Bail<T extends Record<string, unknown>> = {
    [K in Path<T>]?: boolean;
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

    static define<T extends Record<string, unknown>>(options: Options<T>) {
        return new Validator(options);
    }

    validate(...fields: Path<T>[]): ValidationResult<T> {
        this._failed = false;
        this._validated = {};
        this._errors = {};

        for (const [rulePath, ruleObj] of Object.entries(this.rules)) {

            if (!ruleObj) continue;

            const resolvedFields = this.resolvePath(rulePath);

            for (const field of resolvedFields) {
                if (fields.length > 0 && !fields.some(selected => selected === field.path))
                    continue;

                const shouldBail = typeof this.bail === 'boolean'
                    ? this.bail
                    : this.bail[field.path] ?? this.bail[rulePath as Path<T>] ?? true;

                let currentFails = false;

                for (const [ruleKey, ruleParams] of Object.entries(ruleObj)) {

                    const ruleParamProcessed = ruleParams === true
                        ? []
                        : Array.isArray(ruleParams)
                            ? ruleParams
                            : [ruleParams]

                    let res: boolean = false;

                    if (Object.prototype.hasOwnProperty.call(PublicMeta, ruleKey)) {
                        const meta = Meta[ruleKey as keyof typeof PublicMeta] as (
                            value: unknown,
                            ...params: unknown[]
                        ) => boolean;
                        res = meta(field.value, ...ruleParamProcessed);
                    } else if (Object.prototype.hasOwnProperty.call(PrivateMeta, ruleKey)) {
                        const meta = Meta[ruleKey as keyof typeof PrivateMeta] as (
                            value: unknown,
                            values: T,
                            ...params: unknown[]
                        ) => boolean;
                        res = meta(field.value, this._values, ...ruleParamProcessed);
                    } else {
                        throw new Error(`Invalid Rule ${ruleKey}`);
                    }

                    if (!res) {
                        currentFails = true;
                        this._failed = true;
                        const msg = this.resolveMessage(
                            field.path,
                            rulePath as Path<T>,
                            ruleKey as keyof typeof Meta,
                            ruleParamProcessed
                        );

                        let errMsg = this._errors[field.path];
                        if (errMsg) {
                            errMsg.push(msg);
                        } else {
                            this._errors[field.path] = [msg];
                        }

                        if (shouldBail) break;
                    }
                }

                if (!currentFails)
                    this.setNestedValue(field.path, field.value);
            }
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

    private resolvePath(path: string) {
        const segments = path.split('.');
        const result: { path: Path<T>, value: unknown }[] = [];

        const walk = (curr: unknown, i: number, currPath: string[]) => {
            if (i === segments.length) {
                result.push({
                    path: currPath.join(".") as Path<T>,
                    value: curr
                });
                return;
            }

            const segment = segments[i];

            if (segment === '*') {
                if (Array.isArray(curr)) {
                    for (let index = 0; index < curr.length; index++)
                        walk(curr[index], i + 1, [...currPath, String(index)]);
                    return;
                } else if (PlainObject(curr)) {
                    for (const [key, value] of Object.entries(curr))
                        walk(value, i + 1, [...currPath, key]);
                    return;
                } else return;
            }

            if (
                curr !== null &&
                typeof curr === 'object' &&
                Object.prototype.hasOwnProperty.call(curr, segment)
            ) {
                walk(
                    (curr as Record<string, unknown>)[segment],
                    i + 1,
                    [...currPath, segment]
                );
                return;
            }

            const remainingPath = segments.slice(i);

            result.push({
                path: [...currPath, ...remainingPath].join(".") as Path<T>,
                value: undefined
            });

        }

        walk(this._values, 0, []);

        return result;
    }

    private resolveMessage(key: Path<T>, rulePath: Path<T>, rule: keyof typeof Meta, params: unknown[]) {
        let message =
            this.messages?.[key]?.[rule] ??
            this.messages?.[rulePath]?.[rule] ??
            Messages[rule] ??
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

    private setNestedValue(path: string, value: unknown) {
        const segments = path.split(".");

        let current: Record<string, unknown> = this._validated;

        for (let i = 0; i < segments.length - 1; i++) {
            const segment = segments[i];
            const nextSegment = segments[i + 1];

            const existing = Array.isArray(current)
                ? current[Number(segment)]
                : current[segment];

            if (
                !existing ||
                typeof existing !== "object"
            ) {
                const next = /^\d+$/.test(nextSegment) ? [] : {};

                if (Array.isArray(current))
                    current[Number(segment)] = next;
                else
                    current[segment] = next;
            }
            current = Array.isArray(current)
                ? current[Number(segment)]
                : current[segment];
        }
        const lastSegment = segments[segments.length - 1];

        if (Array.isArray(current))
            current[Number(lastSegment)] = value;
        else
            current[lastSegment] = value;
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