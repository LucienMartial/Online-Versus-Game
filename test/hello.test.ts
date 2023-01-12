import { test, expect } from "vitest";
import request from "supertest";
import { app } from "../index";
import { hello } from "../app-shared/hello";
import { Message } from "../app-shared/types";

function sum(a: number, b: number) {
  return a + b;
}

test("shared", async () => {
  const res = hello();
  expect(res).toEqual("Shared text");
});

test("api", async () => {
  const res = await request(app).get("/api");
  expect(res.status).toEqual(200);
  const msg: Message = JSON.parse(res.text);
  expect(msg.content).toEqual("Hello World from API");
  expect(Date.parse(msg.date)).not.toBeNaN();
});

test("first", () => {
  expect(1 + 1).toEqual(2);
});

test("sum", () => {
  expect(sum(1, 2)).toEqual(3);
});
