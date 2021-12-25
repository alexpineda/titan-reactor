import { promises as fsPromises } from "fs";
//D: \dev\bwdata

let _lastBwPath;

export const readCascFile = (filePath: string) => {
    return fsPromises.readFile(`D:/dev/bwdata/${filePath}`);
};
export default readCascFile;

export const openCascStorage = async (bwPath: string) => {
    _lastBwPath = bwPath;
}

export const closeCascStorage = () => { };
