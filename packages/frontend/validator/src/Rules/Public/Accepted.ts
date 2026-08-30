import { PublicRuleDefinition } from "../../Meta";

const Accepted: PublicRuleDefinition = (value) => value === "yes" ||
    value === "on" ||
    value === 1 ||
    value === "1" ||
    value === true ||
    value === "true";

export default Accepted