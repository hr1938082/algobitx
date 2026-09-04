const KeyValueCheck = <
    T extends Record<string, unknown>
>(
    values: T,
    not: boolean,
    ...params: [keyof T, unknown][]
) => {
    for (const [key, valueMustBe] of params) {
        const valueToMatch = values[key];
        if (not) { if (valueToMatch === valueMustBe) return false; }
        else { if (valueToMatch !== valueMustBe) return false; }
    }
    return true;
}

export default KeyValueCheck