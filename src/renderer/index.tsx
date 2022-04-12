if (window.location.search.includes("?config")) {
  import("./ui/configuration/index");
} else if (window.location.search.includes("?iscriptah")) {
  document.write(`<p style="color:white">NOT YET AVAILABLE.</p>`);
} else {
  import("./titan-reactor");
}
