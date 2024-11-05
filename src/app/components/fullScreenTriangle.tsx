import React from "react";
import { BufferGeometry, Float32BufferAttribute } from "three";

function fullScreenTriangle() {
  const geometry = new BufferGeometry();
  geometry.setAttribute(
    "position",
    new Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3)
  );
  geometry.setAttribute(
    "uv",
    new Float32BufferAttribute([0, 0, 2, 0, 0, 2], 2)
  );
  return geometry;
}

export default fullScreenTriangle;
