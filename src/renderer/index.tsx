import { ipcRenderer } from "electron";
ipcRenderer.invoke("who-am-i").then((whoAmI) => {
  if (whoAmI === "config") {
    import("./command-center/command-center");
  } else {
    import("./titan-reactor");
  }
});
