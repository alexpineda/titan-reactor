import { DAT } from "./DAT";
export class WeaponsDAT extends DAT {
  constructor() {
    super();

    this.format = [
      { size: 2, name: "Label", get: this._statTxt("Weapon Label") },
      { size: 4, name: "Graphics", get: this._datValue("Flingy") },
      { size: 1, name: "Unused", get: this._infoValue("Techdata")},
      { size: 2, name: "TargetFlags"}, //'Air,Ground,Mechanical,Organic,non-Building,non-Robotic,Terrain,Organic or Mechanical,Own'
      { size: 4, name: "MinimumRange" },
        { size: 4, name: "MaximumRange" },
      { size: 1, name: "DamageUpgrade", get: this._datValue("Upgrades")},
      { size: 1, name: "WeaponType", get: this._infoValue("DamTypes")},
      { size: 1, name: "WeaponBehavior", get: this._infoValue("Behaviours")},
      { size: 1, name: "RemoveAfter"},
      { size: 1, name: "ExplosionType"},
      { size: 2, name: "InnerSplashRange"},
      { size: 2, name: "MediumSplashRange"},
      { size: 2, name: "OuterSplashRange"},
      { size: 2, name: "DamageAmount"},
      { size: 2, name: "DamageBonus"},
      { size: 1, name: "WeaponCooldown"},
      { size: 1, name: "DamageFactor"},
      { size: 1, name: "AttackAngle"},
      { size: 1, name: "LaunchSpin"},
      { size: 1, name: "ForwardOffset"},
      { size: 1, name: "UpwardOffset"},
      { size: 2, name: "TargetErrorMessage", get: this._statTxt("Targetting Error Message")},
      { size: 2, name: "Icon", get: this._infoValue("Icons")},

    ];

	const flaglens = {'TargetFlags':9}
	this.datname = 'weapons.dat'
	this.idfile = 'Weapons.txt'
	this.filesize = 5460
    this.count = 130
   
  }
}
