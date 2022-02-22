import { CircleGeometry, Mesh, MeshBasicMaterial } from "three";


export default function createStartLocation(
    mapX: number,
    mapY: number,
    color: string,
    mapZ = 0
) {
    const geometry = new CircleGeometry(2, 32);
    const material = new MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.5,
    });
    const circle = new Mesh(geometry, material);
    circle.rotation.x = Math.PI / -2;
    circle.position.x = mapX;
    circle.position.z = mapY;
    circle.position.y = mapZ;
    circle.name = "StartPosition";
    return circle;
}