import BasicRules from "./Basic";
import KeyRules from "./Key";
import KeyValueRules from "./KeyValue";
import ValueRules from "./Value";

const RuleKeyPairs = {
    basic: BasicRules,
    value: ValueRules,
    key: KeyRules,
    key_value: KeyValueRules,
}

export default RuleKeyPairs;