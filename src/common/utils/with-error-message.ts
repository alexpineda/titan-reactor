export const withErrorMessage = (error: unknown, msg: string) => {
    if (error instanceof Error) {
        return `${msg} - ${error.message}`;
    } else {
        return msg;
    }
}