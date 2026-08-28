const Numeric = (value: unknown): value is number => {
    if (typeof value === "number") return Number.isFinite(value);

    if (typeof value !== "string" || value.trim() === "")
        return false;

    return Number.isFinite(Number(value));
}

export default Numeric;