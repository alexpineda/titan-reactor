export class CssText {
    constructor (parent, domParent, sceneWidth, sceneHeight) {
        this.parent = parent;
        this.domParent = domParent;
        this.sceneWidth = sceneWidth;
        this.sceneHeight = sceneHeight;
        this.domElement = this._createElement();
        this.setColor("white")
    }

    _createElement() {
        const el = document.createElement("p");
        el.style.position = "absolute";

        this.domParent.
    }

    setColor(color) {
        this.domElement.style.color = color;
    }
    
    updatePosition (camera) {
        const {x,y} = this._get2DCoords(camera);
        this.domElement.style.left = x + 'px';
        this.domElement.style.top = y + 'px';
    }
    
    _get2DCoords(camera) {
        var vector = this.parent.position.project(camera);
        vector.x = (vector.x + 1)/2 * this.sceneWidth;
        vector.y = -(vector.y - 1)/2 * this.sceneHeight;
        return vector;
    }

    dispose() {
        this.domParent && this.domParent.remove(this.domElement);
    }
}