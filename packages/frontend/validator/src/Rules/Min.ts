import { Validate } from "../Meta";
import Array from "./Array";
import Numeric from "./Numeric";

const Min: Validate = (value: unknown, param: string): boolean => {
    if (!Numeric(param))
        throw new Error(`Invalid min expecting number found ${param}`);

    if (Numeric(value) && value <= param) return true;
    if (Array(value) && value.length <= param) return true;

    return false;
}

export default Min;