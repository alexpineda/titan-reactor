export const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
export const waitUnless = (ms: number, p: Promise<any>) => {
    return new Promise<void>(resolve => {
        const t = setTimeout(resolve, ms);
        p.then(() => {
            clearTimeout(t);
            resolve();
        });
    });
};