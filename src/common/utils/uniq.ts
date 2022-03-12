export default <T>(arr: Array<T>) => [...new Set<T>(arr)];
