import { beforeEach, describe, expect, it } from "vitest";
import { CBuffer } from "../app-shared/utils";

function checkBuffer(
  buffer: CBuffer<number>,
  size: number,
  first: number | undefined,
  last: number | undefined,
  array: number[]
) {
  expect(buffer.size()).toEqual(size);
  expect(buffer.first()).toEqual(first);
  expect(buffer.last()).toEqual(last);
  expect(buffer.slice(-1000, 1000)).toEqual(array);
  expect(buffer.toArray()).toEqual(array);
}

describe("cbuffer basic usage", () => {
  let buffer: CBuffer<number>;

  beforeEach(() => {
    buffer = new CBuffer<number>(2);
  });

  it("just created", () => {
    checkBuffer(buffer, 0, undefined, undefined, []);
  });

  it("add elements", () => {
    buffer.push(10);
    checkBuffer(buffer, 1, 10, 10, [10]);
    buffer.push(20);
    checkBuffer(buffer, 2, 10, 20, [10, 20]);
  });

  it("add exceed capacity", () => {
    buffer.push(10);
    buffer.push(20);
    checkBuffer(buffer, 2, 10, 20, [10, 20]);
    buffer.push(30);
    checkBuffer(buffer, 2, 20, 30, [20, 30]);
  });

  it("shift", () => {
    buffer.push(10);
    buffer.push(20);
    expect(buffer.shift()).toEqual(10);
    checkBuffer(buffer, 1, 20, 20, [20]);
    expect(buffer.shift()).toEqual(20);
    checkBuffer(buffer, 0, undefined, undefined, []);
    expect(buffer.shift()).toBeUndefined();
    checkBuffer(buffer, 0, undefined, undefined, []);
  });

  it("pop", () => {
    buffer.push(10);
    buffer.push(20);
    expect(buffer.pop()).toEqual(20);
    checkBuffer(buffer, 1, 10, 10, [10]);
    expect(buffer.pop()).toEqual(10);
    checkBuffer(buffer, 0, undefined, undefined, []);
    expect(buffer.pop()).toBeUndefined();
    checkBuffer(buffer, 0, undefined, undefined, []);
  });
});

describe("cbuffer slice usage", () => {
  let buffer: CBuffer<number>;

  beforeEach(() => {
    buffer = new CBuffer<number>(5);
    buffer.push(10);
    buffer.push(20);
    buffer.push(30);
    buffer.push(40);
    buffer.push(50);
  });

  it("slice one element", () => {
    expect(buffer.slice(0, 0)).toEqual([]);
    expect(buffer.slice(0, 1)).toEqual([10]);
    expect(buffer.slice(1, 1)).toEqual([20]);
  });

  it("slice multiple elements", () => {
    expect(buffer.slice(1, 2)).toEqual([20, 30]);
    expect(buffer.slice(1, 4)).toEqual([20, 30, 40, 50]);
    expect(buffer.slice(1, 5)).toEqual([20, 30, 40, 50, 10]);
    expect(buffer.slice(1, 6)).toEqual([20, 30, 40, 50, 10]);
    expect(buffer.slice(3, 1)).toEqual([40]);
  });
});
