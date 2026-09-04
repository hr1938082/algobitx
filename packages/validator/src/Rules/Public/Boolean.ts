import { PublicRuleDefinition } from "../../Meta";

const Boolean: PublicRuleDefinition = (value) => value === true ||
    value === false ||
    value === 'true' ||
    value === 'false' ||
    value === 0 ||
    value === 1 ||
    value === '0' ||
    value === '1';

export default Boolean;