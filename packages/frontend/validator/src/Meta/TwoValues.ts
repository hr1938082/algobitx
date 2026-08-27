import { MetaRecord } from ".";
import Between from "../Rules/Public/Between";

const TwoValues = {
    between: { validate: Between, params: 2, type: 'public' }
} as const satisfies MetaRecord;

export default TwoValues

