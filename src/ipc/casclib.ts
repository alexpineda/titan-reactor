import { IndexedDBCache } from "@image/loader/indexed-db-cache";
import { useSettingsStore } from "@stores/settings-store";

const generalCascCache = new IndexedDBCache("general-casc-cache");

useSettingsStore.subscribe((settings) => {
    generalCascCache.enabled = settings.data.utilities.cacheLocally;
});

let _cascurl = "";

export const getCascUrl = () => _cascurl;

export const openCascStorageRemote = async (url = _cascurl) => {
    _cascurl = url;
    return await fetch(`${_cascurl}?open=true`)
        .then((res) => res.ok)
        .catch(() => false);
};

export const closeCascStorageRemote = async () => {
    await fetch(`${_cascurl}?close=true`);
};

export const readCascFileRemote = async (filepath: string) => {
    const url = `${_cascurl}/${filepath}`;
    const buffer = await generalCascCache.getValue(filepath);
    if (buffer !== null) {
        return buffer;
    }
    
    const res = await fetch(url).then((r) => r.arrayBuffer());
    await generalCascCache.setValue({ id: filepath, buffer: res });
    return Buffer.from(res);
    
};
