import React from "react";
import ReactDOM from "react-dom";
import create from "zustand";

export const useStore = create((set) => ({}));
const _components = [];
const _loose = [];

const setStyleSheet = (id, content) => {
  let style;

  style = document.getElementById(id);
  if (!style) {
    style = document.createElement("style");
    style.id = id;
    document.head.appendChild(style);
  }
  style.textContent = content;
};

class TitanChannelComponent extends HTMLElement {
  constructor(plugin, channel) {
    super();
    this.attachShadow({
      mode: "open",
    });

    this._container = document.createElement("main");
    this._stylesheet = document.createElement("style");
    this._userConfigStylesheet = document.createElement("style");
    this.shadowRoot.append(
      this._stylesheet,
      this._userConfigStylesheet,
      this._container
    );

    this.id = channel.id;
    this.pluginId = plugin.id;
    this.config = channel;
    this._userConfig = plugin.userConfig;
    this.setStylesheet(channel.style || "", plugin.userConfig || {});

    // this.style.display = "none";
    this.style.position = "absolute";
  }

  setStylesheet(stylesheet, userConfig) {
    let cssVars = ":host {";
    for (const prop in userConfig) {
      cssVars += `--${prop}: ${userConfig[prop].value};\n`;
    }
    cssVars += "}\n\n";
    this._userConfigStylesheet.textContent = cssVars;
    this._stylesheet.textContent = stylesheet;
  }

  //TODO: use request anim frame
  updateSnapPosition(screenType, screenStatus) {
    // if (this.config.screens.length) {
    //   if (
    //     this.config.screens.find(
    //       (screen) =>
    //         screen.type === screenType && screen.status === screenStatus
    //     )
    //   ) {
    //     if (this.config.position === "fullscreen") {
    //       this.style.left = "0";
    //       this.style.top = "0";
    //       this.style.right = "0";
    //       this.style.bottom = "0";
    //     } else if (this.config.position === "top-left") {
    //       this.style.left = "0";
    //       this.style.top = "0";
    //       this.style.right = "auto";
    //       this.style.bottom = "auto";
    //     }
    //     this.style.display = "block";
    //   } else {
    //     this.style.display = "none";
    //   }
    // }
  }

  connectedCallback() {}
  disconnectedCallback() {}

  render(element) {
    ReactDOM.render(element, this._container);
  }
}
customElements.define("titan-plugin", TitanChannelComponent);

/**
 * 1. Create web components, assign channel ids
 * 2. Create script modules and wait for register calls
 * 3. Assign registered callbacks to channels
 */
const _messageListener = function (event) {
  if (event.data.type === "plugins") {
    for (const plugin of event.data.plugins) {
      for (const channel of plugin.channels) {
        if (channel.scriptContent) {
          // create an encapsulating web component
          if (channel.snap) {
            const component = new TitanChannelComponent(plugin, channel);
            _components.push(component);
            document.body.appendChild(component);
          }
          // initialize the plugin channels custom script and we'll later wait for it to register
          const script = document.createElement("script");
          script.type = "module";
          script.async = true;
          script.innerHTML = channel.scriptContent;
          document.head.appendChild(script);
        }
      }
    }
  } else {
    if (event.data.type === "dimensions") {
      setStyleSheet(
        "game-dimension-css-vars",
        `:root {
            --game-width: ${event.data.payload.width}px,
            --game-height: ${event.data.payload.height}px,
            --minimap-width: ${event.data.payload.minimapWidth}px,
            --minimap-height: ${event.data.payload.minimapHeight}px,
          }`
      );
    } else if (event.data.type === "screen") {
      for (const component of _components) {
        component.updateSnapPosition(
          event.data.payload.type,
          event.data.payload.status
        );
      }
    }

    useStore.setState({ [event.data.type]: event.data.payload });
  }
};
window.addEventListener("message", _messageListener);

export const registerChannel = (channelId, JSXElement) => {
  const component = _components.find((component) => component.id === channelId);
  if (component) {
    component.render(<JSXElement component={component} />);
  } else {
    _loose.push({ channelId, JSXElement });
    ReactDOM.render(
      _loose.map((loose) => <loose.JSXElement key={loose.channelId} />),
      document.getElementById("loose")
    );
  }
};
