import { Float32BufferAttribute, MathUtils, Points, PointsMaterial, BufferGeometry } from "three";

export const distantStars = () => {
    const vertices = [];
    for (let i = 0; i < 10000; i++) {
        const x = MathUtils.randFloatSpread(5000);
        const y = MathUtils.randFloatSpread(5000);
        const z = MathUtils.randFloatSpread(5000);

        if (Math.abs(x) < 250 && Math.abs(z) < 250 && Math.abs(y) < 250) {
            continue;
        }

        vertices.push(x, y, z);
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute(
        "position",
        new Float32BufferAttribute(vertices, 3)
    );
    const material = new PointsMaterial({ color: 0x888888, sizeAttenuation: false, size: 1 });
    material.depthWrite = false;

    return new Points(geometry, material);
}