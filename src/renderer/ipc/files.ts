import { BwDAT, RemotePackage } from "common/types";
// import { ipcRenderer } from "electron";


export const loadDatFilesRemote = async (): Promise<BwDAT> => {
    return {} as BwDAT;
};

export const searchPackagesRemote = async (cb: (val: RemotePackage[]) => void) => {
    cb([]);
};

export const openFile = (file: File) => {
    return new Promise<ArrayBuffer>((resolve, reject) => {
        var reader = new FileReader();
        reader.onloadend = async function (e) {
            if (!e.target!.error && e.target!.readyState != FileReader.DONE)
                reject("FileReader aborted");
            if (e.target!.error) reject(e.target!.error)

            resolve(e.target!.result as ArrayBuffer)
        };
        reader.readAsArrayBuffer(file);
    });
}