export default <T>( arr: T[] ) => [...new Set<T>( arr )];
