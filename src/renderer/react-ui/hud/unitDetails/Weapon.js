import React from "react";

export default ({ weapon }) => {
  console.log("weapon", weapon);
  return (
    <div>
      <div className="flex">
        <p>DMG {weapon.damageAmount}</p>
        <p>UPG {weapon.damageBonus}</p>
        <p>COOLDOWN {weapon.weaponCooldown}</p>
        <p>DAMAGE TYPE {weapon.weaponType}</p>
        <p>EXPLOSION TYPE {weapon.explosionType}</p>
      </div>
    </div>
  );
};

//damageFactor: 1
//damageUpgrade: "Terran Infantry Weapons "
//icon
//innerSplashRange: 0
//launchSpin: 0
//maxRange: 128
//mediumSplashRange: 0
//minRange: 0
//outerSplashRange: 0
//removeAfter: 255
//targetFlags: 3
//upwardOffset: 0
//weaponBehavior: "Appear on Target Unit"
//weaponCooldown: 15
//weaponType: "Normal"
