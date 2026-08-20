const ValidatePositiveInteger = (which: string, value?: string) => {
    if (value === undefined || value.trim() === '') throw new Error(`${which} is not defined`);
    const n = Number(value);
    if (!Number.isInteger(n)) throw new Error(`${which} is not an integer`);
    if (n <= 0) throw new Error(`${which} is not positive`);
    return n;
}

export default ValidatePositiveInteger