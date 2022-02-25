if (window.location.search.includes("?config")) {
  import("./ui/configuration/index");
} else {
  import("./titan-reactor");
}
