import { InitializedPluginPackage } from "common/types";
import { Tab, Tabs } from "muicss/react";
import ReactMarkdown from "react-markdown/index";
import { useControls } from "leva";
import { useEffect } from "react";

const permissionDescriptions = {
  "settings.write": "Allows the plugin to write to the settings file",
  "replay.file": "Allows the plugin to access the replay file entirely",
  "replay.commands": "Allows the plugin to access the replay commands",
};

export default ({
  pluginConfig,
  controls,
}: {
  controls: any[][];
  pluginConfig: InitializedPluginPackage;
}) => {
  useEffect(() => {
    // on mount clear the default leva store
    //@ts-ignore
    __STORE.dispose();
  }, []);

  for (const [folder, data] of controls) {
    useControls(folder, data);
  }

  const permissions = (pluginConfig.config?.system?.permissions ?? []).map(
    (p) => (
      <li>
        {permissionDescriptions[p as keyof typeof permissionDescriptions] ??
          "Invalid Permission"}
      </li>
    )
  );

  return (
    <>
      {!!permissions.length && (
        <div style={{ marginTop: "1rem" }}>
          ⚠️ This plugin has special permissions: <ul>{permissions}</ul>
        </div>
      )}
      <Tabs defaultSelectedIndex={pluginConfig.readme ? 1 : 0}>
        <Tab value="details" label="Details">
          <div style={{ marginTop: "1rem" }}>
            <p>
              <span style={{ fontWeight: "bold" }}>Version:</span>{" "}
              {pluginConfig.version}
            </p>
            {pluginConfig.description && (
              <p>
                <span style={{ fontWeight: "bold" }}>Description:</span>{" "}
                {pluginConfig.description}
              </p>
            )}
            {pluginConfig.author && (
              <p>
                <span style={{ fontWeight: "bold" }}>Author:</span>{" "}
                {typeof pluginConfig.author === "string" ? (
                  pluginConfig.author
                ) : (
                  <>
                    {pluginConfig.author.name}{" "}
                    {pluginConfig.author.email &&
                      `<${pluginConfig.author.email}>`}
                  </>
                )}
              </p>
            )}
            <p>
              <span style={{ fontWeight: "bold" }}>Name:</span>{" "}
              {pluginConfig.name ?? "error: name is required in plugin.json"}
            </p>
            {pluginConfig.date && (
              <p>
                <span style={{ fontWeight: "bold" }}>Date Published:</span>
                {new Intl.DateTimeFormat("en-US").format(pluginConfig.date)}
              </p>
            )}
            {pluginConfig.repository && (
              <p>
                <span style={{ fontWeight: "bold" }}>Repository:</span>
                {typeof pluginConfig.repository === "string" ? (
                  pluginConfig.repository
                ) : (
                  <>
                    {pluginConfig.repository.type}{" "}
                    {pluginConfig.repository.url &&
                      `<${pluginConfig.repository.url}>`}
                  </>
                )}
              </p>
            )}
          </div>
        </Tab>
        {pluginConfig.readme && (
          <Tab value="readme" label="Read Me">
            <div style={{ marginTop: "1rem" }}>
              <ReactMarkdown children={pluginConfig.readme} />
            </div>
          </Tab>
        )}
      </Tabs>
    </>
  );
};
