import DOMPurify from "dompurify";
import get from "lodash.get";

import * as log from "@ipc/log";
import {
  WebComponentPluginChannelConfiguration,
  InitializedPluginChannelConfiguration,
} from "common/types";
import PluginChannel from "./plugin-channel";
import { TitanComponent } from "../web-components/titan-component";

class PluginWebComponentChannel extends PluginChannel {
  private _markup = "<div>Empty</div>";

  domElement = document.createElement("titan-component") as TitanComponent;
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

    this._loadMarkup(getUserConfig, extraStylesheet);
  }

  private async _loadMarkup(
    getUserConfig: () => any,
    extraStylesheet?: string
  ) {
    let text: string;

    try {
      const response = await fetch(this._getUrl());
      text = await response.text();
    } catch (e) {
      log.error(
        `@html-channel: could not fetch plugin markup from ${this._getUrl()}`
      );
      return "";
    }

    this._markup = DOMPurify.sanitize(text, {
      CUSTOM_ELEMENT_HANDLING: {
        tagNameCheck: /^titan-/, // allow all tags starting with "titan-"
        attributeNameCheck: /.*/, // allow all attributes
        allowCustomizedBuiltInElements: false,
      },
      USE_PROFILES: { html: true },
      KEEP_CONTENT: false,
      FORBID_TAGS: ["style", "script"],
    });
    this.domElement.setMarkup(this._markup);
    this.domElement.setStylesheet(extraStylesheet ?? "", getUserConfig());
  }

  override postMessage(): void {
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
