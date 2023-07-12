import { Shape, shapeGenOptions, shapeGenVars } from "./base_shape.js";
import { Vector } from "@notbeer-api";

export class CylinderShape extends Shape {
  private radii: [number, number] = [0, 0];
  private length: number;
  private axis: number;

  protected customHollow = true;

  constructor(axis: number, length: number, radiusX: number, radiusZ?: number) {
    super();
    this.axis = axis;
    this.length = length;
    this.radii[0] = radiusX;
    this.radii[1] = radiusZ ?? this.radii[0];
  }

  public getRegion(loc: Vector) {
    if (this.axis == 0) {
      loc = loc.offset(0, -this.length/2, 0).ceil();
      return <[Vector, Vector]>[
        loc.offset(-this.radii[0], 0, -this.radii[1]),
        loc.offset(this.radii[0], this.length-1, this.radii[1])
      ];
    }
    else if (this.axis == 1) {
      loc = loc.offset(-this.length/2, 0, 0).ceil();
      return <[Vector, Vector]>[
        loc.offset(0, -this.radii[0], -this.radii[1]),
        loc.offset(this.length-1, this.radii[0], this.radii[1])
      ];
    }
    else if (this.axis == 2) {
      loc = loc.offset(0, 0, -this.length/2).ceil();
      return <[Vector, Vector]>[
        loc.offset(-this.radii[0], -this.radii[1], 0),
        loc.offset(this.radii[0], this.radii[1], this.length-1)
      ];
    }
  }

  public getYRange(x: number, z: number) {
    /*
    if (this.axis == 0) {
      const [lX, lZ] = [
        x / (this.radii[0] + 0.5),
        z / (this.radii[1] + 0.5)
      ];

      return (lX*lX + lZ*lZ > 1.0) ? null : <[number, number]>[-this.length/2, this.length-1-this.length/2];
    } else
    if (this.axis == 1) {
      const [lX, lZ] = [
        x / (this.radii[0] + 0.5),
        z / (this.radii[1] + 0.5)
      ];

      return (lX*lX + lZ*lZ > 1.0) ? null : <[number, number]>[-this.length/2, this.length-1-this.length/2];
    } else if (this.axis == 2) {
      const [lX, lZ] = [
        x / (this.radii[0] + 0.5),
        z / (this.radii[1] + 0.5)
      ];

      return (lX*lX + lZ*lZ > 1.0) ? null : <[number, number]>[-this.length/2, this.length-1-this.length/2];
    }
    */
    const [lX, lZ] = [
      x / (this.radii[0] + 0.5),
      z / (this.radii[1] + 0.5)
    ];

    return (lX*lX + lZ*lZ > 1.0) ? null : <[number, number]>[-this.length/2, this.length-1-this.length/2];
  }

  protected prepGeneration(genVars: shapeGenVars, options?: shapeGenOptions) {
    genVars.isHollow = options?.hollow ?? false;
    genVars.radiiOff = this.radii.map(v => v + 0.5);
  }

  protected inShape(relLoc: Vector, genVars: shapeGenVars) {
    if (genVars.isHollow) {
      if (this.axis == 0) {
        const hLocal = [
          relLoc.x / (genVars.radiiOff[0] - 1.0),
          relLoc.z / (genVars.radiiOff[1] - 1.0)
        ];
        if (hLocal[0]*hLocal[0] + hLocal[1]*hLocal[1] < 1.0) {
          return false;
        }
      } else
      if (this.axis == 1) {
        const hLocal = [
          relLoc.y / (genVars.radiiOff[0] - 1.0),
          relLoc.z / (genVars.radiiOff[1] - 1.0)
        ];
        if (hLocal[0]*hLocal[0] + hLocal[1]*hLocal[1] < 1.0) {
          return false;
        }
      } else
      if (this.axis == 2) {
        const hLocal = [
          relLoc.x / (genVars.radiiOff[0] - 1.0),
          relLoc.y / (genVars.radiiOff[1] - 1.0)
        ];
        if (hLocal[0]*hLocal[0] + hLocal[1]*hLocal[1] < 1.0) {
          return false;
        }
      }
    }

    if (this.axis == 0) {
      const local = [
        relLoc.x / genVars.radiiOff[0],
        relLoc.z / genVars.radiiOff[1]
      ];
      if (local[0]*local[0] + local[1]*local[1] <= 1.0) {
        return true;
      }
    } else
    if (this.axis == 1) {
      const local = [
        relLoc.y / genVars.radiiOff[0],
        relLoc.z / genVars.radiiOff[1]
      ];
      if (local[0]*local[0] + local[1]*local[1] <= 1.0) {
        return true;
      }
    } else
    if (this.axis == 2) {
      const local = [
        relLoc.x / genVars.radiiOff[0],
        relLoc.y / genVars.radiiOff[1]
      ];
      if (local[0]*local[0] + local[1]*local[1] <= 1.0) {
        return true;
      }
    }

    return false;
  }
}