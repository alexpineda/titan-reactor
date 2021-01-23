import Stats from "three/examples/jsm/libs/stats.module";

function createStats() {
  const stats = new Stats();
  stats.showPanel(0);
  return stats;
}

export default createStats;
