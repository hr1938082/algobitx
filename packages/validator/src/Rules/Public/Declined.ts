import { PublicRuleDefinition } from "../../Meta";

const Declined: PublicRuleDefinition = (value) => value === "no" ||
    value === "off" ||
    value === 0 ||
    value === "0" ||
    value === false ||
    value === "false"

export default Declined;