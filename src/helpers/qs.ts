import qs, { ParsedQs, IStringifyOptions, IParseOptions } from 'qs';

export const parseQuery = (
  query: string,
  options: IParseOptions & { decoder?: never } = {},
): ParsedQs => {
  return qs.parse(query, {
    ignoreQueryPrefix: true,
    ...options,
  });
};

export const stringifyQuery = (
  query: Object,
  options: IStringifyOptions = {},
): string => {
  return qs.stringify(query, {
    addQueryPrefix: true,
    ...options,
  });
};
