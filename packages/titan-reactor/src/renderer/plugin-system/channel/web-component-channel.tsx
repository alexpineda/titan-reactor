import * as log from "../../ipc/log";
import {
  WebComponentPluginChannelConfiguration,
  InitializedPluginChannelConfiguration,
} from "../../../common/types";
import PluginChannel from "./plugin-channel";
import get from "lodash.get";
import { TitanComponent } from "../web-components/titan-component";

class PluginWebComponentChannel extends PluginChannel {
  private _markup = "<div>Empty</div>";

  domElement?: TitanComponent;
  config: InitializedPluginChannelConfiguration<WebComponentPluginChannelConfiguration>;
  private _getUrl = () => "";

  constructor(
    pluginId: string,
    pluginName: string,
    config: InitializedPluginChannelConfiguration<WebComponentPluginChannelConfiguration>,
    getUserConfig: () => {},
    broadcastMessage: (message: any) => void,
    extraStylesheet?: string
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

    this._loadMarkup(extraStylesheet);
  }

  private async _loadMarkup(extraStylesheet?: string) {
    let text: string;

    try {
      const response = await fetch(this._getUrl());
      text = await response.text();
    } catch (e) {
      log.error(
        `@html-channel: could not fetch plugin markup from ${this._getUrl()} for ${pluginName}`
      );
      return "";
    }

    this._markup = text;
    this.domElement = document.createElement(
      "titan-component"
    ) as TitanComponent;
    this.domElement.setMarkup(this._markup);

    if (extraStylesheet) {
      console.log("setting stylesheet");
      this.domElement.setStylesheet(extraStylesheet);
    } else {
      console.log("no stylesheet");
    }
  }

  override postMessage(message: any): void {
    if (
      // this.config["access.read"] &&
      // message.type === this.config["access.read"][0] &&
      this._markup
    ) {
      // TODO: render content from message
    }
  }
}

export default PluginWebComponentChannel;
