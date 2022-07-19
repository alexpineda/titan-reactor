import { ipcRenderer } from "electron";

ipcRenderer.once("temp-load-content", (_, data) => {
  if (data === "config") {
    import("./command-center/index");
  } else if (data === "iscriptah") {
    document.write(`<p style="color:white">NOT YET AVAILABLE.</p>`);
  } else {
    import("./titan-reactor");
  }
});
