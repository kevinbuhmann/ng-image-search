export interface QueryString {
  [key: string]: string | number | boolean;
}

export function toQueryString(query: QueryString) {
  const params: string[] = [];

  for (const prop in query) {
    if (query.hasOwnProperty(prop) && query[prop] !== undefined) {
      params.push(`${prop}=${encodeURIComponent(query[prop].toString())}`);
    }
  }

  return params.join('&');
}
