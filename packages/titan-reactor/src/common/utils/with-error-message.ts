export default (msg: string, error: unknown) => {
    if (error instanceof Error) {
        return `${msg} - ${error.message}`;
    } else {
        return msg;
    }
}