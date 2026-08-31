import { PublicRuleDefinition } from "../../Meta";

const NotRequired: PublicRuleDefinition = (value) => value === null &&
    value === undefined &&
    value === "";

export default NotRequired