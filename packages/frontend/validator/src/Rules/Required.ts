import { Validate } from "../Meta"

const Required: Validate = (value: unknown, params: string[]): boolean => value !== null &&
    value !== undefined &&
    value !== "";

export default Required