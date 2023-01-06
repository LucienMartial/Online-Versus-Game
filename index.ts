import express from "express";
import http from "http";
import { Server } from "colyseus";
import { WebSocketTransport } from "@colyseus/ws-transport";

import { hello } from "./app-shared/hello.js";
hello();

// express app
const app = express();
const port = process.env.PORT || 3000;
const server = http.createServer(app);

app.use(express.static("dist"));
app.get("/", (req, res) => {
  res.sendFile("index.html");
});

import apiRouter from "./app-server/api.js";
app.use(apiRouter);

// game server
const gameServer = new Server({
  transport: new WebSocketTransport({
    server: server,
  }),
});

if (process.env.NODE_ENV !== "production") {
  // simulate 200ms latency between server and client.
  gameServer.simulateLatency(200);
}

// rooms
import { GameRoom } from "./app-server/game-room.js";
gameServer.define("game", GameRoom);

server.listen(port, () => {
  console.log(`local: http://localhost:${port}`);
});

export { app };
