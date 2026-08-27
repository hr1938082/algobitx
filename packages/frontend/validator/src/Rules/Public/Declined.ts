import { Validate } from "../../Meta";

const Declined: Validate = (value: unknown): boolean => value === "no" ||
    value === "off" ||
    value === 0 ||
    value === "0" ||
    value === false ||
    value === "false"

export default Declined;