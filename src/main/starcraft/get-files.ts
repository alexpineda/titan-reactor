// ported from https://github.com/ShieldBattery/ShieldBattery

import { promises as fsPromises, Stats } from "fs";
import path from "path"

export interface ReadFolderResult {
  isFolder: boolean;
  name: string;
  path: string;
  extension: string;
  date: Date;
};

export default async function readFolder(folderPath: string): Promise<ReadFolderResult[]> {
  const names = await fsPromises.readdir(folderPath);
  const stats = await Promise.all(
    names.map(async (name) => {
      const targetPath = path.join(folderPath, name);
      const stats = await fsPromises.stat(targetPath);
      return [name, targetPath, stats];
    })
  ) as [string, string, Stats][];

  return stats
    .map(([name, targetPath, s]) => {
      return {
        isFolder: s.isDirectory(),
        name,
        path: targetPath,
        extension: !s.isDirectory()
          ? targetPath.substring(targetPath.lastIndexOf(".") + 1).toLowerCase()
          : "",
        date: s.mtime,
      };
    })
    .map((f) => {
      if (!f.isFolder) {
        f.name = f.name.slice(0, -(f.extension.length + 1));
      }
      return f;
    });
}
