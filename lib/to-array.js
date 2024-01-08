export const toArray = any =>
  any instanceof Array
    ? any
    : any === null || any === undefined || any === ''
      ? []
      : any[Symbol.iterator]
        ? [...any]
        : (typeof any === 'object') && !(any instanceof Date)
            ? Object.entries(any)
            : [any]
