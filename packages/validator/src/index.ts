import Meta, { AnyRules, PrivateMeta, PublicMeta } from "./Meta";
import Messages from "./Messages";
import PlainObject from "./Rules/Public/PlainObject";
import UnsafeKeys from "./UnsafeKeys";
import ResolvePath from "./ResolvePath";

type PathValue<
    T,
    AllowWildcard extends boolean = false
> =
    T extends readonly unknown[]
    ? `${number}`
    | "*"
    | `${number}.${PathValue<T[number], true>}`
    | `*.${PathValue<T[number], true>}`

    : T extends object
    ? (
        {
            [K in keyof T & string]:
            T[K] extends readonly unknown[] | object
            ? K | `${K}.${PathValue<T[K], true>}`
            : K
        }[keyof T & string]
        |
        (
            AllowWildcard extends true
            ? "*"
            | `*.${PathValue<T[keyof T & string], true>}`
            : never
        )
    )

    : never;

export type Path<T> = PathValue<T>;

export type Rules<T extends object> = {
    [k in Path<T>]?: AnyRules<T>
}

export type Message<T extends object> = {
    [K in Path<T>]?: {
        [Rule in keyof typeof Meta]?: string;
    };
};

export type Bail<T extends object> = {
    [K in Path<T>]?: boolean;
}

export type ValidationError<T extends object> = {
    [K in Path<T>]?: string[];
}

export interface Options<T extends object> {
    values: T;
    rules?: Rules<T>;
    messages?: Message<T>;
    bail?: boolean | Bail<T>
}

export interface ValidationResult<T extends object> {
    failed: boolean;
    validated: Partial<T>;
    errors: ValidationError<T>;
}

class Validator<T extends object> {
    private _values: T;
    private rules: Rules<T>;
    private messages?: Message<T>;
    private bail: boolean | Bail<T>;
    private _failed = false;
    private _validated: Partial<T> = Object.create(null);
    private _errors: ValidationError<T> = Object.create(null);

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

    static define<T extends object>(options: Options<T>) {
        return new Validator(options);
    }

    validate(...fields: Path<T>[]): ValidationResult<T> {
        this._failed = false;
        this._validated = Object.create(null);
        this._errors = Object.create(null);

        for (const [rulePath, ruleObj] of Object.entries(this.rules)) {

            if (!ruleObj) continue;

            const resolvedFields = ResolvePath(this._values, rulePath);

            for (const field of resolvedFields) {
                if (
                    fields.length > 0 &&
                    !fields.some(selected => this.matchesPath(selected, field.path))
                )
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
                        const meta = Meta[ruleKey as keyof typeof PrivateMeta]
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

                if (!currentFails && field.resolved)
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
        this._validated = Object.create(null);
        this._errors = Object.create(null);
        return this;
    }

    private matchesPath(selected: Path<T>, resolved: Path<T>): boolean {
        const selectedSegments = selected.split(".");
        const resolvedSegments = resolved.split(".");

        if (selectedSegments.length !== resolvedSegments.length)
            return false;

        return selectedSegments.every(
            (segment, index) =>
                segment === "*" ||
                segment === resolvedSegments[index]
        );
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

    private setNestedValue(path: Path<T>, value: unknown) {
        const segments = path.split(".");

        let current: Record<string, unknown> = this._validated;

        for (let i = 0; i < segments.length - 1; i++) {
            const segment = segments[i];
            const nextSegment = segments[i + 1];

            if (UnsafeKeys.has(segment))
                throw new Error(`Unsafe validation path: ${path}`);

            const existing = Array.isArray(current)
                ? current[Number(segment)]
                : current[segment];

            if (
                !existing ||
                typeof existing !== "object"
            ) {
                const next = /^\d+$/.test(nextSegment) ? [] : Object.create(null);

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

        if (UnsafeKeys.has(lastSegment))
            throw new Error(`Unsafe validation path: ${path}`);

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


Validator.define({
    values: {
        test: {
            test: {
                id: 1,
                name: "Test",
                email: "test@example.com",
                role: ['admin', 'user']
            },
            test2: {
                id: 2,
                name: "Test2",
                email: "test2@example.com",
                role: ['user']
            }
        },
        test2: {
            test: {
                id: 1,
                name: "Test",
                email: "test@example.com",
                role: ['admin', 'user']
            },
            test2: {
                id: 2,
                name: "Test2",
                email: "test2@example.com",
                role: ['user']
            }
        }
    },
    rules: {
        "test.*.*": { required: true, plain_object: true }
    }
})