import { PublicRuleDefinition } from "../../Meta";

const Required: PublicRuleDefinition = (value) => value !== null &&
    value !== undefined &&
    value !== "";

export default Required