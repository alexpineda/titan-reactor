import Stats from "three/examples/jsm/libs/stats.module";

export function createStats() {
  const stats = new Stats();
  stats.showPanel(0);
  document.body.appendChild(stats.dom);
  return stats;
}
