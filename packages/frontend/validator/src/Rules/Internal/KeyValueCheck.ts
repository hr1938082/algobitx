import PlainObject from "../Public/PlainObject";
import String from "../Public/String";

const KeyValueCheck = (values: unknown, ...params: unknown[]) => {
    if (params.length === 0 && params.length % 2 !== 0)
        throw new Error("Invalid key value");

    if (!PlainObject(values)) throw new Error("Invalid Values");

    for (let index = 0; index < params.length; index + 2) {
        const valueToMatchKey = params[index];
        if (!String(valueToMatchKey))
            throw new Error(`Invalid Key expecting string found ${valueToMatchKey}`);

        const valueToMatch = values[valueToMatchKey];
        const valueMustBe = params[index + 1];
        if (valueToMatch !== valueMustBe) return false;
    }

    return true;
}

export default KeyValueCheck