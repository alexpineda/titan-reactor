import * as dat from "dat.gui";
import Stats from "stats.js";
import options from "./options";

const bindFields = (folder, control, method) => {
  return method(
    folder.add.bind(folder, control),
    folder.addColor.bind(folder, control)
  );
};

const controller = (key, parentFolder, control) => {
  control[key] = options[key].values;
  const folder = parentFolder.addFolder(key[0].toUpperCase() + key.substr(1));
  return [key, bindFields(folder, control[key], getFieldsFn(key))];
};

export const getFieldsFn = (key) => {
  return (add, addColor) => {
    const fields = Object.keys({
      ...options[key].values,
      ...options[key].args,
    });

    return fields
      .map((field) => {
        let name = field,
          args = options[key].args[field] || [];

        const fn = name.toLowerCase().includes("color") ? addColor : add;
        return [name, fn(name, ...args)];
      })
      .reduce((obj, [name, fn]) => {
        obj[name] = fn;
        return obj;
      }, {});
  };
};

export function createStats() {
  const stats = new Stats();
  stats.showPanel(0);
  document.body.appendChild(stats.dom);
  return stats;
}

export function createGui() {
  const gui = new dat.GUI();
  const listeners = {};

  const on = function (eventName, handler) {
    if (listeners[eventName]) {
      listeners[eventName].push(handler);
    } else {
      listeners[eventName] = [handler];
    }
  };
  const dispatch = function (eventName, eventData) {
    listeners[eventName] &&
      listeners[eventName].forEach((handler) => handler(eventData));
  };

  let control = new (function () {
    const ctrl = this;
    this.on = on;

    this.state = {
      tileset: "Jungle",
      save: function () {
        localStorage.setItem(this.tileset, JSON.stringify(ctrl));
      },
      load: function () {
        const json = JSON.parse(localStorage.getItem(this.tileset));

        for (const [key, value] of Object.entries(json)) {
          Object.assign(ctrl[key], value);
        }

        gui.updateDisplay();
        return ctrl;
      },
    };

    this.scene = {
      save: function () {
        dispatch("scene:save");
      },
    };
  })();

  const stateFolder = gui.addFolder("State");
  stateFolder.add(control.state, "tileset", [
    "Badlands",
    "Space",
    "Installation",
    "Ashworld",
    "Jungle",
    "Desert",
    "Ice",
    "Twilight",
  ]);
  stateFolder.add(control.state, "save");
  stateFolder.add(control.state, "load");

  const scene = gui.addFolder("Scene");
  const textures = gui.addFolder("Textures");

  const controllerGroups = Object.entries(options)
    .map(([key, option]) => {
      let parent = gui;
      if (option.parent === "scene") {
        parent = scene;
      } else if (option.parent === "textures") {
        parent = textures;
      }

      return controller(key, parent, control);
    })
    .reduce((obj, [key, controllers]) => {
      //key -> prop -> fn
      obj[key] = controllers;
      return obj;
    }, {});

  Object.entries(controllerGroups).forEach(([key, group]) => {
    const onChangeAnyCbs = [];
    const onFinishChangeAnyCbs = [];

    Object.values(group).forEach((ctrl) => {
      ctrl.onChange &&
        ctrl.onChange(() => onChangeAnyCbs.forEach((cb) => cb(control[key])));
      ctrl.onFinishChange &&
        ctrl.onFinishChange(() =>
          onFinishChangeAnyCbs.forEach((cb) => cb(control[key]))
        );
    });

    group.onChangeAny = (cb) => onChangeAnyCbs.push(cb);
    group.onFinishChangeAny = (cb) => onFinishChangeAnyCbs.push(cb);
  });

  gui.show();
  return {
    control,
    controllers: controllerGroups,
  };
}
