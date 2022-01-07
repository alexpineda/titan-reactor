import range from "../../common/utils/range";
import ResearchBW from "../integration/fixed-data/research";
import UpgradeBW from "../integration/fixed-data/upgrade";

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

  const researchBW = new ResearchBW(ResearchBW.STRUCT_SIZE, 0, researchCount, Int8Array.from(researchBuffer), Uint8Array.from(researchBuffer));

  const upgradeBW = new UpgradeBW(UpgradeBW.STRUCT_SIZE, 0, upgradeCount, Int8Array.from(upgradeBuffer), Uint8Array.from(upgradeBuffer));

  // manually inject bwDat stuff since we're on a worker
  // researchBW.bwDat = { tech: _techDat };
  // upgradeBW.bwDat = { upgrades: _upgradesDat };

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
      if (r.ownerId === i) {
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
          _completedResearch[i].push({
            ...researchObj,
            timeCompleted: Date.now(),
          });
        }
      }
    }

    for (const upgrade of upgradesInProgress) {
      hasUpgrade = true;
      if (upgrade.remainingBuildTime === 100) {
        upgradeNearComplete = true;
      }
      if (upgrade.ownerId === i) {
        // if completed upgrade exists update count once and replace build time
        const existing = upgrades[i].find((u) => u.typeId === upgrade.typeId);
        if (existing) {
          if (existing.remainingBuildTime === 0) {
            existing.count++;
            existing.buildTime =
              _upgradesDat[upgrade.typeId].researchTimeBase +
              _upgradesDat[upgrade.typeId].researchTimeFactor * upgrade.level;
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
          _completedUpgrades[i].push({
            ...upgradeObj,
            timeCompleted: Date.now(),
          });
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
