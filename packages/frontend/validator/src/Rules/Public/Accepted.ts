import { Validate } from "../../Meta"

const Accepted: Validate = (value: unknown): boolean => value === "yes" ||
    value === "on" ||
    value === 1 ||
    value === "1" ||
    value === true ||
    value === "true";

export default Accepted