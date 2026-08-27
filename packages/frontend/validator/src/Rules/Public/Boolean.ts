import { Validate } from "../../Meta";

const Boolean: Validate = (value: unknown): boolean => value === true ||
    value === false ||
    value === 'true' ||
    value === 'false' ||
    value === 0 ||
    value === 1 ||
    value === '0' ||
    value === '1';

export default Boolean;