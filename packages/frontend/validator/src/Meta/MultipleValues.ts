import { MetaRecord } from ".";
import Contains from "../Rules/Public/Contains";

const MultipleValues = {
    contains: { validate: Contains, params: Number.MAX_SAFE_INTEGER, type: 'public' }
} as const satisfies MetaRecord;

export default MultipleValues