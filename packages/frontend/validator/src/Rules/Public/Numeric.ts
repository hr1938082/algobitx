const Numeric = (value: unknown): value is number => {
    const n = Number(value);
    return Number.isFinite(n);
}

export default Numeric;