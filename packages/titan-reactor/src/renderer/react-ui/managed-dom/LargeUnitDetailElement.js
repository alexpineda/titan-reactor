import UnitDetailLayers from "./UnitDetailLayers";
import ProgressBar from "./ProgressBar";

//todo p probe Building
const unitStatus = {
  zerg: "Morphing",
  terran: "Building",
  protoss: "Opening Warp Gate",
};

//todo t (main building) addon Adding On
const buildingStatus = {
  zerg: "Mutating",
  terran: "Under Construction",
  protoss: "Opening Warp Rift",
};

const upgradeStatus = {
  zerg: "Evolving",
  terran: "Upgrading",
  protoss: "Upgrading",
};

const techStatus = {
  zerg: "Evolving",
  terran: "Researching",
  protoss: "Developing",
};

const getRaceString = (unitType) => {
  if (unitType.isZerg) {
    return "zerg";
  } else if (unitType.isTerran) {
    return "terran";
  } else if (unitType.isProtoss) {
    return "protoss";
  }
};

export default class LargeUnitDetailElement extends UnitDetailLayers {
  constructor(wireframeIcons) {
    super();
    this.wireframeIcons = wireframeIcons;
    this.domElement = document.createElement("div");
    this.imgWrapper = document.createElement("div");
    this.imgWrapper.style.position = "relative";
    this.imgWrapper.style.width = "128px";
    this.imgWrapper.style.height = "128px";

    this.layers = [
      document.createElement("div"),
      document.createElement("div"),
      document.createElement("div"),
      document.createElement("div"),
      document.createElement("div"),
      document.createElement("div"),
    ];

    let _zIndex = 10;
    this.layers.forEach((layer, i) => {
      layer.style.width = "128px";
      layer.style.height = "128px";
      layer.style.position = "absolute";
      //   layer.style.zIndex = _zIndex--;
      layer.style.backgroundPositionX = `-${i * 128}px`;
      this.imgWrapper.appendChild(layer);
    });

    //shields
    this.layers[4].style.filter = "hue-rotate(200deg)";
    this.layers[5].style.filter = "hue-rotate(200deg)";

    this.name = document.createElement("p");
    this.name.style.color = "white";

    this.status = document.createElement("p");
    this.status.style.color = "white";

    this.hpAndShields = document.createElement("span");
    this.hpAndShields.classList.add("flex");

    this.hp = document.createElement("p");
    this.shields = document.createElement("p");
    this.shields.style.color = "white";

    this.hpAndShields.appendChild(this.shields);
    this.hpAndShields.appendChild(this.hp);

    this.kills = document.createElement("p");
    this.construction = document.createElement("div");

    this.progress = new ProgressBar();

    this.domElement.appendChild(this.name);
    this.domElement.appendChild(this.imgWrapper);
    this.domElement.appendChild(this.status);
    this.domElement.appendChild(this.hpAndShields);
    this.domElement.appendChild(this.kills);
    this.domElement.appendChild(this.construction);
    this.domElement.appendChild(this.progress.domElement);

    this.domElement.style.display = "none";
    this.value = "";
  }

  set value(unit) {
    this._value = unit;
    if (unit) {
      const unitTypeId =
        unit.unitType.isZerg && unit.unitType.isBuilding && unit.queue.length
          ? unit.queue[0]
          : unit.typeId;
      for (let i = 0; i < 4; i++) {
        const layer = this.layers[i];
        layer.style.backgroundImage = `url(${this.wireframeIcons.wireframes[unitTypeId]}`;
        layer.style.filter = this.getFilter(unit, i);
      }

      this.name.textContent = unit.unitType.name;

      if (unit.isResourceContainer) {
        this.hp.textContent = "";
      } else {
        const healthPct = unit.hp / unit.unitType.hp;
        let color = "#d60000";
        if (healthPct > 0.66) {
          color = "#00cc00";
        } else if (healthPct > 0.33) {
          color = "#aaaa00";
        }
        this.hp.textContent = `${unit.hp}/${unit.unitType.hp}`;
        this.hp.style.color = color;
      }

      if (unit.remainingBuildTime > 0) {
        this.progress.value = unit.remainingBuildTime / unit.buildTime;

        let status = "";
        if (unit.unitType.isBuilding) {
          status = buildingStatus[getRaceString(unit.unitType)];
        } else {
          status = unitStatus[getRaceString(unit.unitType)];
        }
        this.status.textContent = status;
      } else {
        this.progress.hide();
        this.status.textContent = "";
      }

      if (unit.unitType.shieldsEnabled) {
        this.shields.textContent = `${unit.shields}/${unit.unitType.shields}`;
        this.shields.style.display = "block";

        this.layers[4].style.backgroundImage = `url(${this.wireframeIcons.wireframes[unitTypeId]}`;
        this.layers[5].style.backgroundImage = `url(${this.wireframeIcons.wireframes[unitTypeId]}`;

        if (unit.shields === 0) {
          this.layers[4].style.display = "none";
          this.layers[5].style.display = "none";
        } else if (unit.shields === unit.unitType.shields) {
          this.layers[4].style.display = "block";
          this.layers[5].style.display = "block";
        } else {
          this.layers[4].style.display = "block";
          this.layers[5].style.display = "none";
        }
      } else {
        this.shields.style.display = "none";
        this.layers[4].style.display = "none";
        this.layers[5].style.display = "none";
      }

      //   this.kills.textContent = `${unit.kills} kills`;
      //   this.energy.textContent = `${unit.energy}/${unit.unitType.energy}`;
      //shield/maxshield
      //construction
      //kills

      //   this.textNode.nodeValue = val.id;
      this.domElement.style.display = "block";
    } else {
      this.domElement.style.display = "none";
    }
  }

  get value() {
    return this._value;
  }
}
