import { MetaRecord } from ".";

const TwoValues = {
    between: { validate: (value: unknown, params: string[]) => true, params: 2 }
} as const satisfies MetaRecord;

export default TwoValues

