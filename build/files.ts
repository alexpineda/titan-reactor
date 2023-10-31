import { promises as fsPromises, Stats, constants } from "node:fs";
import path from "node:path";
import os from "node:os";

export interface ReadFolderResult {
    isFolder: boolean;
    name: string;
    path: string;
    extension: string;
    date: Date;
}

export default async function readFolder(
    folderPath: string
): Promise<ReadFolderResult[]> {
    const names = await fsPromises.readdir(folderPath);
    const stats = (await Promise.all(
        names.map(async (name) => {
            const targetPath = path.join(folderPath, name);
            const stats = await fsPromises.stat(targetPath);
            if (typeof stats === "string") {
                throw new Error("stats is a string");
            }
            return [name, targetPath, stats];
        })
    )) as unknown as [string, string, Stats][];

    return stats
        .map(([name, targetPath, s]) => {
            return {
                isFolder: s.isDirectory(),
                name,
                path: targetPath,
                extension: !s.isDirectory()
                    ? targetPath
                          .substring(targetPath.lastIndexOf(".") + 1)
                          .toLowerCase()
                    : "",
                date: s.mtime,
            };
        })
        .map((f) => {
            if (!f.isFolder) {
                f.name = f.name.slice(0, -(f.extension.length + 1));
            }
            return f;
        }) as ReadFolderResult[];
}

export async function useTempDir(cb?: (dir: string) => Promise<void>) {
    let dir = "";

    try {
        dir = await fsPromises.mkdtemp(path.join(os.tmpdir(), "tr-"));
    } catch (e: unknown) {
        if (!(await fileExists(dir))) {
            throw new Error((e as Error).message);
        }
    }

    const rmDir = () => {
        try {
            fsPromises.rm(dir, { recursive: true, force: true });
        } catch (e) {
            console.log("useTempDir failed to cleanup", e);
        }
    }

    if (cb) {
        try {
            await cb(dir);
        } catch (e) {}
        rmDir();
    }

    return { dir, cleanup: rmDir };
    
}

export const foldersExist = async (rootDirectory: string, directories: string[]) => {
    if (await fileExists(rootDirectory)) {
        for (const folder of directories) {
            if (!(await fileExists(path.join(rootDirectory, folder)))) {
                return false;
            }
        }
    } else {
        return false;
    }
    return true;
};

export async function fileExists(path: string) {
    try {
        await fsPromises.access(path, constants.R_OK);
        return true;
    } catch (err) {
        return false;
    }
}
