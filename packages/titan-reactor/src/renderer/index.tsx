if (window.location.search.includes("?config")) {
  import("./ui/configuration/index");
} else if (window.location.search.includes("?plugins")) {
  document.write(`<p style="color:white">hello plugins</p>`);
} else {
  import("./titan-reactor");
}
