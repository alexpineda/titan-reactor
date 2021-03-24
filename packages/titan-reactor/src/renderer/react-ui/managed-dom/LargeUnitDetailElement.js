import UnitWireframe from "./UnitWireframe";
import ProgressBar from "./ProgressBar";
import UnitQueue from "./UnitQueue";

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
  constructor(cmdIcons, wireframeIcons, gameIcons) {
    this.frame = 0;

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

    this.hpAndShields = document.createElement("span");
    this.hp = document.createElement("p");
    this.shields = document.createElement("p");
    this.shields.style.color = "white";

    this.energy = document.createElement("span");
    this.energyImg = document.createElement("img");
    this.energyImg.classList.add("inline", "w-4");
    this.energyImg.src = gameIcons.energy;

    this.energyText = document.createElement("p");
    this.energyText.classList.add("text-gray-300");
    this.energy.appendChild(this.energyImg);
    this.energy.appendChild(this.energyText);

    this.hpAndShields.appendChild(this.shields);
    this.hpAndShields.appendChild(this.hp);

    this.kills = document.createElement("p");
    this.kills.classList.add("text-gray-400");

    this.progress = new ProgressBar();

    this.domElement.appendChild(this.unitSection);
    this.domElement.appendChild(this.statsSection);

    this.unitSection.appendChild(this.name);
    this.unitSection.appendChild(this.wireframe.domElement);
    this.unitSection.appendChild(this.progress.domElement);
    this.unitSection.appendChild(this.queue.domElement);

    this.statsSection.appendChild(this.hpAndShields);
    this.statsSection.appendChild(this.energy);
    this.statsSection.appendChild(this.kills);

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

      this.queue.update(unit);

      this.progress.frame = this.frame;
      if (unit.remainingBuildTime > 0 && !unit.unitType.isResourceContainer) {
        this.progress.value = unit.remainingBuildTime / unit.buildTime;
      } else if (unit.remainingTrainTime > 0) {
        this.progress.value = unit.remainingTrainTime / 255;
      } else {
        this.progress.hide();
      }

      if (unit.unitType.shieldsEnabled) {
        this.shields.textContent = `${unit.shields}/${unit.unitType.shields}`;
      } else {
        this.shields.textContent = "";
      }

      // const maxEnergy = 200;
      if (unit.unitType.isSpellcaster) {
        this.energyText.textContent = `${unit.energy}`;
        this.energy.style.display = "block";
      } else {
        this.energy.style.display = "none";
      }

      if (unit.unitType.isBuilding) {
        this.kills.textContent = "";
      } else {
        this.kills.textContent = `Kills: ${unit.kills}`;
      }

      //   this.kills.textContent = `${unit.kills} kills`;
      //   this.energy.textContent = `${unit.energy}/${unit.unitType.energy}`;

      this.domElement.style.display = "flex";
    } else {
      this.domElement.style.display = "none";
    }
  }

  get value() {
    return this._value;
  }
}
