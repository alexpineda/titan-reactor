// import { ipcRenderer } from "electron";

// window.openconfig = () => import("./command-center/index");
// window.openmain = () => {
//   alert("hi");
import { ipcRenderer } from "electron";
// import "./command-center/index";
ipcRenderer.invoke("who-am-i").then((whoAmI) => {
  console.log(whoAmI);
  if (whoAmI === "config") {
    import("./command-center/index");
  } else {
    import("./titan-reactor");
  }
});

// };

// ipcRenderer.once("query", (_, data) => {
//   if (data === "config") {
//   } else if (data === "iscriptah") {
//     document.write(`<p style="color:white">NOT YET AVAILABLE.</p>`);
//   } else {
//     import("./titan-reactor");
//   }
// });
