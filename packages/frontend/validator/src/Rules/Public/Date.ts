import String from "./String";

const Date = (value: unknown): value is string => {
    if (!String(value)) return false;
    const date = new globalThis.Date(value);
    return !Number.isNaN(date.getTime());
}

export default Date;