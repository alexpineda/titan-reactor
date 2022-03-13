import { InitializedPluginPackage } from "common/types";
import { Tab, Tabs } from "muicss/react";
import ReactMarkdown from "react-markdown/index";

export default ({
  pluginConfig,
}: {
  pluginConfig: Pick<
    InitializedPluginPackage,
    | "version"
    | "description"
    | "author"
    | "name"
    | "repository"
    | "date"
    | "readme"
  >;
}) => (
  <Tabs>
    <Tab value="details" label="Details">
      <div>
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
                {pluginConfig.author.email && `<${pluginConfig.author.email}>`}
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
        <ReactMarkdown children={pluginConfig.readme} />
      </Tab>
    )}
  </Tabs>
);