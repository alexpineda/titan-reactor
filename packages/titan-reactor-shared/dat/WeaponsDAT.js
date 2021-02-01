import { DAT } from "./DAT";
export class WeaponsDAT extends DAT {
  constructor(readFile, flingy = {}) {
    super(readFile);

    this.format = [
      { size: 2, name: "name", get: (i) => this.stats[i] },
      { size: 4, name: "flingy", get: (i) => flingy[i] },
      { size: 1, name: "unused" },
      { size: 2, name: "targetFlags" }, //'Air,Ground,Mechanical,Organic,non-Building,non-Robotic,Terrain,Organic or Mechanical,Own'
      { size: 4, name: "minRange" },
      { size: 4, name: "maxRange" },
      { size: 1, name: "damageUpgrade" },
      { size: 1, name: "damageType" },
      { size: 1, name: "weaponBehavior" },
      { size: 1, name: "removeAfter" },
      { size: 1, name: "explosionType" },
      { size: 2, name: "innerSplashRange" },
      { size: 2, name: "mediumSplashRange" },
      { size: 2, name: "outerSplashRange" },
      { size: 2, name: "damageAmount" },
      { size: 2, name: "damageBonus" },
      { size: 1, name: "weaponCooldown" },
      { size: 1, name: "damageFactor" },
      { size: 1, name: "attackAngle" },
      { size: 1, name: "launchSpin" },
      { size: 1, name: "forwardOffset" },
      { size: 1, name: "upwardOffset" },
      { size: 2, name: "targetErrorMessage", get: (i) => this.stats[i] },
      { size: 2, name: "icon" },
    ];

    const flaglens = { TargetFlags: 9 };
    this.datname = "weapons.dat";
    this.filesize = 5460;
    this.count = 130;
  }

  post(entries) {
    return entries.map((entry, i) => {
      entry.index = i;
    });
  }
}
