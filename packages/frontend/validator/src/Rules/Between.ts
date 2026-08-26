import { Validate } from "../Meta";
import Array from "./Array";
import Numeric from "./Numeric";
import String from "./String";

const Between: Validate = (value: unknown, ...params: string[]): boolean => {
    if (params.length !== 2 && !Numeric(params[0]) && !Numeric(params[1]))
        throw new Error(`Invalid Between expecting two numbers found ${params.length}`);

    const min = params[0];
    if (!Numeric(min))
        throw new Error(`Invalid Between expecting min value to be number found ${min}`);

    const max = params[0];
    if (!Numeric(max))
        throw new Error(`Invalid Between expecting min value to be number found ${max}`);

    return (Numeric(value) && value >= min && value <= max) ||
        ((String(value) || Array(value)) && value.length >= min && value.length <= max);
}

export default Between;