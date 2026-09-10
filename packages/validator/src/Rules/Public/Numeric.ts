const Numeric = (value: unknown): value is number => {
    if (typeof value === "number") return Number.isFinite(value);
    return false;
}

export default Numeric;