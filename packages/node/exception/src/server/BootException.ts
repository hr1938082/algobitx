import Exception from "../Exception";

class BootException extends Exception {
    constructor(err?: unknown) {
        super(
            "Boot Exception",
            {
                cause: err !== undefined
                    ? { cause: err }
                    : undefined
            }
        );
    }

}

export default BootException