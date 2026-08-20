import ValidatePositiveInteger from "./ValidatePositiveInteger";

const ValidatePort = (which: string, port?: string,) => {
    const n = ValidatePositiveInteger(which, port);
    if (n < 1 || n > 65535) throw new Error(`${which} must be between 1 and 65535`);
    return n;
}

export default ValidatePort