export class DebugInfo {
  constructor() {
    const infoDiv = document.createElement("div");
    infoDiv.style.top = "10px";
    infoDiv.style.left = "10px";
    infoDiv.style.position = "absolute";
    infoDiv.style.color = "white";
    document.body.appendChild(infoDiv);
    this.domElement = infoDiv;
  }

  append(str) {
    this.domElement.innerHTML += str + "<br/>";
  }
  clear() {
    this.domElement.innerHTML = "";
  }

  dispose() {
    this.domElement && this.domElement.remove();
  }
}
