import UnitWireframe from "./UnitWireframe";
import ProgressBar from "./ProgressBar";
import UnitQueue from "./UnitQueue";

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

export default class LargeUnitDetailElement {
  constructor(cmdIcons, wireframeIcons) {
    this.domElement = document.createElement("div");
    this.domElement.classList.add("flex", "relative");

    this.unitSection = document.createElement("div");
    this.unitSection.classList.add("flex", "flex-col", "items-center", "px-1");
    this.unitSection.style.width = "180px";

    this.statsSection = document.createElement("div");
    this.queue = new UnitQueue(cmdIcons);

    this.wireframe = new UnitWireframe(wireframeIcons);

    this.name = document.createElement("p");
    this.name.classList.add("text-white", "text-center");

    this.status = document.createElement("p");
    this.status.classList.add("text-sm", "text-gray-400", "absolute");

    this.hpAndShields = document.createElement("span");
    this.hp = document.createElement("p");
    this.shields = document.createElement("p");
    this.shields.style.color = "white";

    this.hpAndShields.appendChild(this.shields);
    this.hpAndShields.appendChild(this.hp);

    this.kills = document.createElement("p");

    this.progress = new ProgressBar();

    this.domElement.appendChild(this.unitSection);
    this.domElement.appendChild(this.statsSection);

    this.unitSection.appendChild(this.name);
    this.unitSection.appendChild(this.wireframe.domElement);
    this.unitSection.appendChild(this.kills);
    this.unitSection.appendChild(this.progress.domElement);
    this.unitSection.appendChild(this.status);
    this.unitSection.appendChild(this.queue.domElement);

    this.statsSection.appendChild(this.hpAndShields);

    this.domElement.style.display = "none";
    this.value = "";
  }

  set value(unit) {
    this._value = unit;
    if (unit) {
      this.wireframe.update(unit);
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

      let remainingBuildTime = unit.remainingBuildTime;
      let buildTime = unit.buildTime;

      if (unit.queue) {
        remainingBuildTime = unit.queue.remainingBuildTime;
        buildTime = unit.queue.buildTime;
      }

      if (unit.unitType.isZerg) {
        this.queue.hide();
      } else {
        this.queue.update(unit);
      }

      if (remainingBuildTime > 0) {
        this.progress.value = remainingBuildTime / buildTime;

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
      } else {
        this.shields.style.display = "none";
      }

      //   this.kills.textContent = `${unit.kills} kills`;
      //   this.energy.textContent = `${unit.energy}/${unit.unitType.energy}`;
      //shield/maxshield
      //kills

      this.domElement.style.display = "flex";
    } else {
      this.domElement.style.display = "none";
    }
  }

  get value() {
    return this._value;
  }
}
