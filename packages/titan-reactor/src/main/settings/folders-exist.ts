import fileExists from "../../common/utils/file-exists";
import path from "path";

export default async (bwDir: string, folders: string[]) => {
    if (await fileExists(bwDir)) {
      for (const folder of folders) {
        if (
          !(await fileExists(
            path.join(bwDir, folder)
          ))
        ) {
         return false;
        }
      }
    }
    return true;
}