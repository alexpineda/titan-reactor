import JsxParser from "react-jsx-parser";
import * as log from "../../ipc/log";
import {
  HTMLPluginChannelConfiguration,
  InitializedPluginChannelConfiguration,
} from "../../../common/types";
import PluginChannel from "./plugin-channel";
import get from "lodash.get";

class PluginHTMLChannel extends PluginChannel {
  private _markup = "<div>Empty</div>";

  Component?: JSX.Element;
  config: InitializedPluginChannelConfiguration<HTMLPluginChannelConfiguration>;
  private _getUrl = () => "";

  constructor(
    pluginId: string,
    pluginName: string,
    config: InitializedPluginChannelConfiguration<HTMLPluginChannelConfiguration>,
    getUserConfig: () => {},
    broadcastMessage: (message: any) => void
  ) {
    super(pluginId, getUserConfig, broadcastMessage);
    this.config = config;

    if (this.config["access.read"]) {
      if (this.config["access.read"].length > 1) {
        log.warning(
          `@html-channel: Only one access.read permission is allowed for HTML Template plugins - ${pluginName}`
        );
      }
    } else {
      log.error(`@html-channel: Plugin ${pluginName} has no access.read`);
      return;
    }

    this._getUrl = () => {
      if (getUserConfig()) {
        const userPropRegex = /{(([a-zA-Z0-9_]+\.?)+)}/g;
        const matches = userPropRegex.exec(config.url);

        // allow userConfig properties to be used in the url eg {myProp}.html or {}
        if (matches) {
          const propPath = matches[1].split(".");
          return config.url.replace(
            userPropRegex,
            get(getUserConfig(), propPath, "")
          );
        }
      }
      return config.url;
    };

    fetch(this._getUrl())
      .then(
        (response) => response.text(),
        () => {
          log.error(
            `@html-channel: could not fetch plugin markup from ${this._getUrl()} for ${pluginName}`
          );
          return "";
        }
      )
      .then((text) => {
        this._markup = text;
      });
  }

  override postMessage(message: any): void {
    if (
      this.config["access.read"] &&
      message.type === this.config["access.read"][0] &&
      this._markup
    ) {
      // TODO: render content from message
      this.Component = <JsxParser bindings={message} jsx={this._markup} />;
    }
  }
}

export default PluginHTMLChannel;
