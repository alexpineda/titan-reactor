import { InitializedPluginPackage } from "common/types";

export default ({
  pluginConfig,
}: {
  pluginConfig: InitializedPluginPackage;
}) => (
  <div>
    <p>
      <span style={{ fontWeight: "bold" }}>Version:</span>{" "}
      {pluginConfig.version}
    </p>
    <p>
      <span style={{ fontWeight: "bold" }}>Author:</span>{" "}
      {pluginConfig.author ?? "unknown"}
    </p>
    <p>
      <span style={{ fontWeight: "bold" }}>Name:</span>{" "}
      {pluginConfig.name ?? "error: name is required in plugin.json"}
    </p>
    <p>
      <span style={{ fontWeight: "bold" }}>Update Status:</span>
      {pluginConfig.repository
        ? "up to date"
        : "package.json has no repository field"}
    </p>
  </div>
);
