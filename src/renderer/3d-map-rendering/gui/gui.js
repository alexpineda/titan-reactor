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

const getFieldsFn = (key) => {
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

export class SceneGui {
  constructor() {
    const gui = new dat.GUI();
    const control = {
      state: {
        tileset: "Jungle",
        save: this.save,
        load: this.load,
      },
    };

    const stateFolder = gui.addFolder("State");
    const scene = gui.addFolder("Scene");
    const textures = gui.addFolder("Textures");

    const controllers = Object.entries(options)
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

    Object.entries(controllers).forEach(([key, group]) => {
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

    //special state group
    stateFolder.add(control.state, "save");
    stateFolder.add(control.state, "load");
    controllers["state"] = {
      tileset: stateFolder.add(control.state, "tileset", [
        "Badlands",
        "Space",
        "Installation",
        "Ashworld",
        "Jungle",
        "Desert",
        "Ice",
        "Twilight",
      ]),
    };

    gui.show();
    this.controllers = controllers;
    this.control = control;
    this.gui = gui;
  }

  save() {
    localStorage.setItem(this.tileset, JSON.stringify(this.control));
  }

  load(tileset) {
    try {
      const json = JSON.parse(localStorage.getItem(tileset || this.tileset));

      for (const [key, value] of Object.entries(json)) {
        Object.assign(this.control[key], value);
      }

      this.gui.updateDisplay();
    } catch (e) {
      console.error(`error loading tileset state config`);
    }
  }
}

export function createGui() {}
