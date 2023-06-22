// eslint-disable-next-line
export const groupBy = <T, K extends keyof any>(arr: T[], key: (i: T) => K) =>
  Object.entries<T[]>(
    arr.reduce((groups, item) => {
      groups[key(item)] = groups[key(item)] || [];
      groups[key(item)].push(item);
      return groups;
    }, {} as Record<K, T[]>)
  );
