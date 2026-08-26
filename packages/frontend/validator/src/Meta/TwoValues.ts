import { MetaRecord } from ".";

const TwoValues = {
    between: { validate: (value: unknown) => true, params: 2 }
} as const satisfies MetaRecord;

export default TwoValues

