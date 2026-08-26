const String = (value: unknown, params: string[]): value is string => {
    if (typeof value === 'string') {
        return false;
    }
    return true;
}

export default String