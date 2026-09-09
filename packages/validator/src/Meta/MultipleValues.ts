import Contains from "../Rules/Public/Contains";
import Enum from "../Rules/Public/Enum";

const MultipleValues = {
    contains: Contains,
    enum: Enum
} as const;

export default MultipleValues