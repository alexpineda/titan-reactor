import { InitializedPluginPackage } from "common/types";
import ReactMarkdown from "react-markdown/index";
import { Leva, useControls } from "leva";
import semver from "semver";
import packagejson from "../../../package.json";
import { Tab, Tabs } from "./tabs";
import ErrorBoundary from "./error-boundary";

const permissionDescriptions = {
  "settings.write": "Allows the plugin to write to the settings file",
  "replay.file": "Allows the plugin to access the replay file entirely",
  "replay.commands":
    "Allows the plugin to access the replay commands like select units, move and attack.",
};

export default ({
  pluginPackage,
  controls,
}: {
  controls: any[][];
  pluginPackage: Partial<InitializedPluginPackage>;
}) => {
  for (const [folder, data] of controls) {
    useControls(folder, data, [pluginPackage.id]);
  }

  const permissions = (pluginPackage.config?.system?.permissions ?? []).map(
    (p) => (
      <li>
        {permissionDescriptions[p as keyof typeof permissionDescriptions] ??
          "Invalid Permission"}
      </li>
    )
  );

  const titanReactorApiVersion = packagejson.config["titan-reactor-api"];
  const pluginApiVersion =
    pluginPackage.peerDependencies?.["titan-reactor-api"] ?? "1.0.0";

  return (
    <ErrorBoundary>
      <Leva
        fill
        flat
        hideCopyButton
        titleBar={false}
        theme={{
          colors: {
            accent1: "blue",
            accent2: "orange",
            accent3: "red",
            elevation1: "red",
            elevation2: "#f5f5f5",
            elevation3: "#d9e0f0",
            highlight1: "black",
            highlight2: "#222",
            highlight3: "#333",
            vivid1: "red",
          },
          sizes: {
            controlWidth: "40vw",
          },
          fontSizes: {
            root: "14px",
          },
        }}
      />
      {semver.major(titanReactorApiVersion) <
        semver.major(pluginApiVersion) && (
        <p>
          ⚠️ This plugin is out of date. Titan Reactor Plugin API is{" "}
          {titanReactorApiVersion} and this plugin API version is{" "}
          {pluginApiVersion}
        </p>
      )}
      {pluginPackage.name?.startsWith("@titan-reactor-plugins/") && (
        <div style={{ marginTop: "1rem" }}>✅ This is an official plugin.</div>
      )}
      {!!permissions.length && (
        <div style={{ marginTop: "1rem" }}>
          ⚠️ This plugin has special permissions: <ul>{permissions}</ul>
        </div>
      )}
      <Tabs defaultSelectedIndex={pluginPackage.readme ? 1 : 0}>
        <Tab label="Details">
          <div style={{ marginTop: "1rem" }}>
            <p>
              <span style={{ fontWeight: "bold" }}>Version:</span>{" "}
              {pluginPackage.version}
            </p>
            {pluginPackage.description && (
              <p>
                <span style={{ fontWeight: "bold" }}>Description:</span>{" "}
                {pluginPackage.description}
              </p>
            )}
            {pluginPackage.author && (
              <p>
                <span style={{ fontWeight: "bold" }}>Author:</span>{" "}
                {typeof pluginPackage.author === "string" ? (
                  pluginPackage.author
                ) : (
                  <>
                    {pluginPackage.author.name}{" "}
                    {pluginPackage.author.email &&
                      `<${pluginPackage.author.email}>`}
                  </>
                )}
              </p>
            )}
            <p>
              <span style={{ fontWeight: "bold" }}>Name:</span>{" "}
              {pluginPackage.name ?? "error: name is required in plugin.json"}
            </p>
            {pluginPackage.date && (
              <p>
                <span style={{ fontWeight: "bold" }}>Date Published:</span>
                {new Intl.DateTimeFormat("en-US").format(pluginPackage.date)}
              </p>
            )}
            {pluginPackage.repository && (
              <p>
                <span style={{ fontWeight: "bold" }}>Repository:</span>
                {typeof pluginPackage.repository === "string" ? (
                  pluginPackage.repository
                ) : (
                  <>
                    {pluginPackage.repository.type}{" "}
                    {pluginPackage.repository.url &&
                      `<${pluginPackage.repository.url}>`}
                  </>
                )}
              </p>
            )}
          </div>
        </Tab>
        {pluginPackage.readme && (
          <Tab label="Read Me">
            <div style={{ marginTop: "1rem" }}>
              <ReactMarkdown children={pluginPackage.readme} />
            </div>
          </Tab>
        )}
      </Tabs>
    </ErrorBoundary>
  );
};
