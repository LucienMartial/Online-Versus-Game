import * as PIXI from "pixi.js";

/**
 * Helper containing basic shape initialization methods
 */
class Graphics {
  static createRectangle(
    width = 100,
    height = 100,
    color = 0x990000
  ): PIXI.Graphics {
    const obj = new PIXI.Graphics();
    obj.beginFill(color);
    obj.drawRect(0, 0, width, height);
    return obj;
  }

  static createCircle(radius = 100, color = 0x990000): PIXI.Graphics {
    const obj = new PIXI.Graphics();
    obj.beginFill(color);
    obj.drawCircle(0, 0, radius);
    return obj;
  }

  static createLine(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    thickness = 5,
    color = 0x990000
  ): PIXI.Graphics {
    const obj = new PIXI.Graphics();
    obj.lineStyle(thickness, color);
    obj.moveTo(x1, y1);
    obj.lineTo(x2, y2);
    return obj;
  }
}

export { Graphics };
