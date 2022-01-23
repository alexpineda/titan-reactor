export const testKeys = (e: KeyboardEvent, keys: string) => {
    return keys.split(",").some(key => testKey(e, key));
}

export const testKey = (e: KeyboardEvent, key: string | undefined) => {
    if (!key) return false;
    return e.code === key.trim().slice(-e.code.length);
}