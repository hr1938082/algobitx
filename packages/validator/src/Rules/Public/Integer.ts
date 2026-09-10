const Integer = (value: unknown): value is number => {
    if (typeof value === "number") return Number.isInteger(value);
    return false;
}

export default Integer;