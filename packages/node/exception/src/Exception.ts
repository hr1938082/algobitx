abstract class Exception extends Error {
    constructor(
        message: string,
        options?: ErrorOptions
    ) {
        super(message, options);
        this.name = new.target.name;
        Error.captureStackTrace?.(this, new.target)
    }

    report() {
        console.error(this);
    }
}

export default Exception;