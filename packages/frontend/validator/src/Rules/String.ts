const String = (value: unknown, params: string[]): value is string =>
    typeof value === 'string';

export default String;