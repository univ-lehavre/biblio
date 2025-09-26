type QueryValue = string | number | boolean | Array<string | number | boolean> | undefined;

type Query = Record<string, QueryValue>;

export type { Query };
