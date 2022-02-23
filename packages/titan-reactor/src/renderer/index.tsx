if (window.location.search.includes("?config")) {
  import("./ui/configuration/index");
} else {
  import("./ui/titan-reactor");
}
