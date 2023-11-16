export const withErrorMessage = ( error: unknown, msg: string ) => {
    if ( error instanceof Error ) {
        return `${msg} - ${error.message} ${import.meta.env.DEV && error.stack}`;
    } else {
        return msg;
    }
};
