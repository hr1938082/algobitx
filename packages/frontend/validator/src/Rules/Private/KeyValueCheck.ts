const KeyValueCheck = <
    T extends Record<string, unknown>
>(
    values: T,
    ...params: [keyof T, unknown][]
) => {

    for (let index = 0; index < params.length; index++) {
        const valueToMatch = values[params[index][0]];
        const valueMustBe = params[index][1];
        if (valueToMatch !== valueMustBe) return false;
    }

    return true;
}

export default KeyValueCheck