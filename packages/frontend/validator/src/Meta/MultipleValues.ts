import { MetaRecord } from ".";
import Contains from "../Rules/Contains";

const MultipleValues = {
    contains: { validate: Contains, params: Number.MAX_SAFE_INTEGER }
} as const satisfies MetaRecord;

export default MultipleValues