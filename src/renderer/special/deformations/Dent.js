import * as THREE from "three";
import { Vector2 } from "three";

// straight lifted https://github.com/mrdoob/three.js/issues/4917
export const Dent = function (obj, origin, direction, radius, depth) {
  var M = new THREE.Matrix4().getInverse(obj.matrixWorld);
  var origin = origin.applyMatrix4(M);

  var normal = new THREE.Vector3();
  normal.copy(direction);
  normal.multiplyScalar(-radius * (1 - depth));

  var centerSphere = new THREE.Vector3();
  centerSphere.addVectors(origin, normal);
  var Sphere = new THREE.Sphere(centerSphere, radius);

  for (var i = 0; i < obj.geometry.vertices.length; i++) {
    if (centerSphere.distanceTo(obj.geometry.vertices[i]) < radius) {
      var Ray = new THREE.Ray(obj.geometry.vertices[i], direction);
      var punct = Ray.intersectSphere(Sphere, new THREE.Vector3());
      obj.geometry.vertices[i] = punct;
    }
  }

  obj.geometry.computeFaceNormals();
  obj.geometry.computeVertexNormals();
  obj.geometry.verticesNeedUpdate = true;
  obj.geometry.normalsNeedUpdate = true;
};
