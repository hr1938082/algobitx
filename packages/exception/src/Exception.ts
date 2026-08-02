abstract class Exception extends Error {
    constructor(
        message: string
    ) {
        super(message);
        this.name = this.constructor.name;
    }

    abstract report(): void | Promise<void>
}

export default Exception;