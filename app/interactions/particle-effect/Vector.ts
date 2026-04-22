class Vector {
  x: number;
  y: number;

  constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }

  static random2D(): Vector {
    const angle = Math.random() * Math.PI * 2;
    return new Vector(Math.cos(angle), Math.sin(angle));
  }

  static dist(v1: Vector, v2: Vector): number {
    const dx = v2.x - v1.x;
    const dy = v2.y - v1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  setMagnitude(length: number): Vector {
    const currentMagnitude = Math.sqrt(this.x * this.x + this.y * this.y);
    const scale = length / currentMagnitude;
    this.x *= scale;
    this.y *= scale;
    return this;
  }

  addVector(other: Vector): Vector {
    this.x += other.x;
    this.y += other.y;
    return this;
  }
}

export default Vector;
