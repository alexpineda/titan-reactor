import { range } from "ramda";
import { Buffer } from "buffer/";
import ResearchBW from "../bw/ResearchBW";
import UpgradeBW from "../bw/UpgradeBW";

let _techDat, _upgradesDat, _completedResearch, _completedUpgrades;

onmessage = function ({ data }) {
  const {
    type,
    techDat,
    upgradesDat,
    frame,
    researchCount,
    upgradeCount,
    upgradeBuffer,
    researchBuffer,
  } = data;

  if (type === "init") {
    _techDat = techDat;
    _upgradesDat = upgradesDat;
    _completedResearch = range(0, 8).map(() => []);
    _completedUpgrades = range(0, 8).map(() => []);
    return;
  }

  const researchBW = new ResearchBW();
  const upgradeBW = new UpgradeBW();

  researchBW.count = researchCount;
  if (researchCount) {
    researchBW.buffer = Buffer.from(researchBuffer);
  }
  upgradeBW.count = upgradeCount;
  if (upgradeCount) {
    upgradeBW.buffer = Buffer.from(upgradeBuffer);
  }

  const researchInProgress = researchBW.instances();
  const upgradesInProgress = upgradeBW.instances();

  let hasTech = false;
  let hasUpgrade = false;
  let techNearComplete = false;
  let upgradeNearComplete = false;

  const research = range(0, 8).map(() => []);
  const upgrades = range(0, 8).map(() => []);

  for (let i = 0; i < 8; i++) {
    research[i] = [..._completedResearch[i]];
    upgrades[i] = [..._completedUpgrades[i]];

    for (const r of researchInProgress) {
      hasTech = true;
      if (r.remainingBuildTime === 100) {
        techNearComplete = true;
      }
      if (r.owner === i) {
        const researchObj = {
          ...r,
          icon: _techDat[r.typeId].icon,
          count: 1,
          buildTime: _techDat[r.typeId].researchTime,
          isTech: true,
          timeAdded: Date.now(),
        };
        research[i].push(researchObj);
        if (r.remainingBuildTime === 0) {
          _completedResearch[i].push(researchObj);
        }
      }
    }

    for (const upgrade of upgradesInProgress) {
      hasUpgrade = true;
      if (upgrade.remainingBuildTime === 100) {
        upgradeNearComplete = true;
      }
      if (upgrade.owner === i) {
        // if completed upgrade exists update count once and replace build time
        const existing = upgrades[i].find((u) => u.typeId === upgrade.typeId);
        if (existing) {
          if (existing.remainingBuildTime === 0) {
            existing.count++;
          }
          existing.remainingBuildTime = upgrade.remainingBuildTime;
          continue;
        }

        const upgradeObj = {
          ...upgrade,
          icon: _upgradesDat[upgrade.typeId].icon,
          count: upgrade.level,
          buildTime:
            _upgradesDat[upgrade.typeId].researchTimeBase +
            _upgradesDat[upgrade.typeId].researchTimeFactor * upgrade.level,
          isUpgrade: true,
          timeAdded: Date.now(),
        };
        upgrades[i].push(upgradeObj);
        if (upgrade.remainingBuildTime === 0) {
          _completedUpgrades[i].push(upgradeObj);
        }
      }
    }
  }

  postMessage({
    frame,
    techNearComplete,
    upgradeNearComplete,
    hasTech,
    hasUpgrade,
    research,
    upgrades,
    completedUpgrades: _completedUpgrades,
    completedResearch: _completedResearch,
  });
};
