import { Validate } from "../../Meta"

const Required: Validate = (value: unknown): boolean => value !== null &&
    value !== undefined &&
    value !== "";

export default Required