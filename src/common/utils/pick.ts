export default <T extends object>( names: string[], obj: T ) => {
    const result: Partial<T> = {};
    for ( const name of names ) {
        if ( name in obj ) {
            result[name as keyof T] = obj[name as keyof T];
        }
    }
    return result;
};
