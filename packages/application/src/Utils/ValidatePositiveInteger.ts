const ValidatePositiveInteger = (which: string, value?: any) => {
    if (!value) throw new Error(`${which} is not defined`);
    const timeout = Number(value);
    if (!Number.isInteger(timeout)) throw new Error(`${which} is not an integer`);
    if (timeout <= 0) throw new Error(`${which} is not positive`);
    return timeout;
}

export default ValidatePositiveInteger