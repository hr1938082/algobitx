const String = (value: unknown): value is string =>
    typeof value === 'string';

export default String;